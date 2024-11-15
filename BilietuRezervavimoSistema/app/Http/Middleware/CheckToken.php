<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\JWT\JwtTokens;
use App\Models\User;

class CheckToken
{
    protected $jwt;

    public function __construct()
    {
        $this->jwt = new JwtTokens();
    }

    public function handle(Request $request, Closure $next)
    {
        // Retrieve the Bearer token from the Authorization header
        $accessToken = $request->bearerToken();

        // Check if the token is null
        if (!$accessToken) {
            return response()->json(['message' => 'Token not provided'], 401);
        }

        // Check if the access token is expired or if the user is valid
        if ($this->isTokenExpired($accessToken)) {
            $refreshToken = $request->cookie('refresh_token');

            /*
            // Attempt to refresh the token if a refresh token exists
            if ($refreshToken) {
                $tokens = $this->refreshAccessToken($refreshToken);

                if ($tokens) {
                    // Update the request with the new access token
                    $accessToken = $tokens['access_token'];
                    $request->headers->set('Authorization', 'Bearer ' . $accessToken);
    
                    // Set new refresh token as cookie
                    return $next($request)->withCookie(
                        cookie(
                            'refresh_token',
                            $tokens['refresh_token'],
                            60, // 1 hour
                            '/',
                            null,
                            env('APP_ENV') !== 'local',
                            true,
                            false,
                            env('SESSION_SAME_SITE', 'lax')
                        )
                    );
                } else {
                    return response()->json(['message' => 'Unauthorized'], 401);
                }
            } else {
                return response()->json(['message' => 'Unauthorized: Refresh token expired'], 401);
            }*/

            return response()->json(['message' => 'Unauthorized: accees token needs to be refreshed'], 401);
        }

        // Decode the token to retrieve the user from the 'sub' claim
        $user = $this->getUserFromToken($accessToken);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        $request->user = $user;

        return $next($request);
    }

    private function isTokenExpired($accessToken)
    {
        try {
            $decoded = JWT::decode($accessToken, new Key(env('JWT_SECRET'), 'HS256'));

            // Validate issuer and audience
            $expectedIssuer = env('JWT_ISSUER', 'BilietSistema');
            $expectedAudience = env('JWT_AUDIENCE', 'Client');
            if ($decoded->iss !== $expectedIssuer || $decoded->aud !== $expectedAudience) {
                return true;
            }

            // Check if the token is expired
            return Carbon::now()->timestamp > $decoded->exp;

        } catch (\Exception $e) {
            Log::error('Token decoding failed', ['error' => $e->getMessage()]);
            return true; // Expired or invalid token
        }
    }

    private function getUserFromToken($accessToken)
    {
        try {
            $decoded = JWT::decode($accessToken, new Key(env('JWT_SECRET'), 'HS256'));

            // Retrieve the user based on the 'sub' claim
            $user = DB::table('users')->where('id', $decoded->sub)->first();

            if (!$user) {
                Log::warning('User not found for token sub', ['sub' => $decoded->sub]);
                return null;
            }

            return $user;
        } catch (\Exception $e) {
            Log::error('Error retrieving user from token', ['error' => $e->getMessage()]);
            return null;
        }
    }

    private function refreshAccessToken($refreshToken)
    {
        // Find the user based on the remember_token
        $user = User::where('remember_token', $refreshToken)->first();

        if (!$user) {
            return null; // Invalid refresh token
        }

        // Retrieve the latest active session for the user
        $session = DB::selectOne("
            SELECT * FROM token_sessions
            WHERE user_id = ? AND is_revoked = false AND refresh_expires_at > NOW()
            ORDER BY initiated_at DESC
            LIMIT 1
        ", [$user->id]);

        if (!$session) {
            return null; // Session expired or invalid
        }

        // Generate new access token and refresh token
        $newAccessToken = $this->jwt->createJwtToken($user);
        $newRefreshToken = bin2hex(random_bytes(40));

        // Update session and user tokens in the database
        $newRefreshTokenExpiresAt = Carbon::now()->addHours(5); // 1 hour
        $newAccessTokenExpiresAt = Carbon::now()->addMinutes(10); // 10 minutes

        DB::update("
            UPDATE token_sessions
            SET refresh_expires_at = ?, expires_at = ?
            WHERE id = ?
        ", [
            $newRefreshTokenExpiresAt,
            $newAccessTokenExpiresAt,
            $session->id,
        ]);

        DB::update("UPDATE users SET remember_token = ? WHERE id = ?", [$newRefreshToken, $user->id]);

        return [
            'access_token' => $newAccessToken,
            'refresh_token' => $newRefreshToken
        ];
    }
}