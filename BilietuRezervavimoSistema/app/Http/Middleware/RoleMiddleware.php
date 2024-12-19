<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;
use Firebase\JWT\ExpiredException;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Enums\UserRole;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, $role)
    {
        $token = $request->bearerToken();
    
        if (!$token) {
            return response()->json(['message' => 'Token not provided'], 401);
        }
    
        try {
            $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
            $user = User::find($decoded->sub);
    
            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }
    
            $userRoleValue = $user->role instanceof UserRole ? $user->role->value : $user->role;
            $requiredRoleValue = (int)$role;
    
            if ($userRoleValue < $requiredRoleValue) {
                return response()->json(['message' => 'Forbidden: Access denied'], 403);
            }
    
            $session = DB::table('token_sessions')
                ->where('user_id', $user->id)
                ->where('is_revoked', false)
                ->where('expires_at', '>', Carbon::now())
                ->latest('initiated_at')
                ->first();
    
            if (!$session) {
                return response()->json(['message' => 'Session expired or revoked'], 401);
            }
    
            $request->setUserResolver(function () use ($user) {
                return $user;
            });
        } catch (ExpiredException $e) {
            return response()->json(['message' => 'Token expired'], 401);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Token invalid'], 401);
        }
    
        return $next($request);
    }
}