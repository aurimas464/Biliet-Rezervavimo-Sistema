<?php

namespace App\Http\JWT;

use App\Models\User;
use Carbon\Carbon;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Log;

class JwtTokens
{
    private $jwt_secret;

    public function __construct()
    {
        $this->jwt_secret = env('JWT_SECRET', 'your-secret-key');
    }

    // Create JWT Token
    public function createJwtToken(User $user)
    {
        $issuedAt = Carbon::now()->timestamp;
        $expiration = Carbon::now()->addMinutes(10)->timestamp;
        $payload = [
            'jti' => uniqid(),
            'sub' => $user->id,
            'name' => $user->name,
            'exp' => $expiration,
            'iat' => $issuedAt,
            'iss' => env('JWT_ISSUER', 'BilietSistema'),
            'aud' => env('JWT_AUDIENCE', 'Client'),
        ];

        return JWT::encode($payload, $this->jwt_secret, 'HS256');
    }

    // Decode JWT Token
    public function decodeToken($token)
    {
        try {
            return JWT::decode($token, new Key($this->jwt_secret, 'HS256'));
        } catch (\Exception $e) {
            Log::error('Failed to decode JWT token', ['error' => $e->getMessage()]);
            return null; // Return null if decoding fails
        }
    }
}