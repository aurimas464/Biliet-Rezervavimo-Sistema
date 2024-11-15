<?php

namespace App\Providers;

use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\CheckToken;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    public function boot()
    {
        parent::boot();

        // Register middlewares with aliases
        Route::aliasMiddleware('role', RoleMiddleware::class);
        Route::aliasMiddleware('checkToken', CheckToken::class);
    }

    public function map()
    {
        $this->mapApiRoutes();
    }

    protected function mapApiRoutes()
    {
        Route::prefix('api')
            ->middleware('api')
            ->namespace($this->namespace)
            ->group(base_path('routes/api.php'));
    }
}