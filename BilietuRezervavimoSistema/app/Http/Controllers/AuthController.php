<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Firebase\JWT\Key;
use App\Models\User;
use App\Http\JWT\JwtTokens;
use App\Models\Token_Session;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cookie;
use App\Enums\UserRole;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;           

class AuthController extends Controller
{
    protected $jwt;

    public function __construct()
    {
        $this->jwt = new JwtTokens();
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'nullable|in:' . implode(',', array_column(UserRole::cases(), 'value')), 
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $role = $request->input('role', UserRole::GUEST->value);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $role + 1,
        ]);
        $user['role'] = $role - 1;
        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user = Auth::user();
        if (!$user instanceof User) {
            Auth::logout();
            return response()->json(['message' => 'Unexpected error occurred. Please try again.'], 500);
        }

        // Generate Access and Refresh Tokens using jwt_tokens
        $accessToken = $this->jwt->createJwtToken($user); // Use jwt_tokens class to create JWT
        $refreshToken = bin2hex(random_bytes(40));

        // Set expiration times
        $accessTokenExpiresAt = Carbon::now()->addMinutes(10); // 10 minutes for access token
        $refreshTokenExpiresAt = Carbon::now()->addHours(5); // 5 hours for refresh token

        // Create session in the database
        $sql = "INSERT INTO token_sessions (user_id, device, initiated_at, expires_at, refresh_expires_at, is_revoked) 
                VALUES (?, ?, NOW(), ?, ?, false)";
        DB::insert($sql, [
            $user->id,
            $request->header('User-Agent'),
            $accessTokenExpiresAt,
            $refreshTokenExpiresAt,
        ]);

        // Update the remember_token in the users table with the refresh token
        DB::update("UPDATE users SET remember_token = ? WHERE id = ?", [$refreshToken, $user->id]);

        // Create the response object
        $response = response()->json([
            'message' => 'Login successful',
            'access_token' => $accessToken,
            'user' => $user,
        ], 200);

        // Attach the refresh token cookie to the response with a 1-hour expiration
        return $response->withCookie(
            cookie(
                'refresh_token',
                $refreshToken,
                60,
                '/',
                null,
                false,
                true,
                false,
                'Lax'
            )
        );
    }

    public function refresh(Request $request)
    {
        // Retrieve the refresh token from the cookie
        $refreshToken = $request->cookie('refresh_token');

        Log::warning($refreshToken);


        if (!$refreshToken) {
            return response()->json(['message' => 'Refresh token not provided'], 401);
        }

        // Retrieve the user based on the remember_token
        $user = DB::table('users')->where('remember_token', $refreshToken)->first();

        if (!$user) {
            return response()->json(['message' => 'Invalid or expired refresh token'], 401);
        }

        // Retrieve the latest active session for the user that has not expired or been revoked
        $session = DB::selectOne("
            SELECT * FROM token_sessions
            WHERE user_id = ? AND is_revoked = false AND refresh_expires_at > NOW()
            ORDER BY initiated_at DESC
            LIMIT 1
        ", [$user->id]);


        if (!$session) {
            return response()->json(['message' => 'Session expired or invalid'], 401);
        }

        // Generate a new access token
        $newAccessToken = $this->jwt->createJwtToken(User::find($user->id)); // Use jwt_tokens class

        // Generate a new refresh token and set new expiration dates
        $newRefreshToken = bin2hex(random_bytes(40));
        $newRefreshTokenExpiresAt = Carbon::now()->addHours(5); // 5 hours
        
        //$newAccessTokenExpiresAt = Carbon::now()->addSecond();
        $newAccessTokenExpiresAt = Carbon::now()->addMinutes(10); // 10 minutes

        // Update the session in the database
        DB::update("
            UPDATE token_sessions
            SET refresh_expires_at = ?, expires_at = ?
            WHERE id = ?
        ", [
            $newRefreshTokenExpiresAt,
            $newAccessTokenExpiresAt,
            $session->id,
        ]);

        // Update the remember_token in the users table with the new refresh token
        DB::update("UPDATE users SET remember_token = ? WHERE id = ?", [$newRefreshToken, $user->id]);

        // Create the response object
        $response = response()->json([
            'message' => 'Refresh successful',
            'access_token' => $newAccessToken,
        ], 200);

        // Attach the new refresh token as an HTTP-only cookie
        return $response->withCookie(
            cookie(
                'refresh_token',
                $newRefreshToken,
                60,
                '/',
                null,
                false,
                true,
                false,
                'Lax'
            )
        );
    }

    public function logout(Request $request)
    {
        // Retrieve the refresh token from the cookie
        $refreshToken = $request->cookie('refresh_token');
    
        if (!$refreshToken) {
            return response()->json(['message' => 'Refresh token not provided'], 401);
        }
    
        // Find the user based on the remember_token
        $user = DB::table('users')->where('remember_token', $refreshToken)->first();
    
        if (!$user) {
            return response()->json(['message' => 'Invalid refresh token'], 401);
        }
    
        // Revoke the latest active session for the user
        DB::update("
            UPDATE token_sessions
            SET is_revoked = true
            WHERE user_id = ? AND is_revoked = false
            ORDER BY initiated_at DESC
            LIMIT 1
        ", [$user->id]);
    
        // Clear the remember_token in the users table
        DB::update("UPDATE users SET remember_token = NULL WHERE id = ?", [$user->id]);
    
        // Clear the refresh token cookie
        $response = response()->json([
            'message' => 'Logged out successfully',
        ], 200);
    
        return $response->withCookie(
            cookie()->forget('refresh_token')
        );
    } 
}