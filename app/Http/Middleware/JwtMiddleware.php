<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Exceptions\JWTException;

class JwtMiddleware
{
    /**
     * Handle an incoming request.
     * Validasi token JWT di setiap request yang dilindungi.
     */
    public function handle(Request $request, Closure $next)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();

            if (!$user) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Pengguna tidak ditemukan.',
                ], 401);
            }

        } catch (TokenExpiredException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Token telah kedaluwarsa. Silakan login kembali.',
            ], 401);

        } catch (TokenInvalidException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Token tidak valid.',
            ], 401);

        } catch (JWTException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Token tidak ditemukan. Silakan login terlebih dahulu.',
            ], 401);
        }

        return $next($request);
    }
}
