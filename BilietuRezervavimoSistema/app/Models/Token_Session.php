<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Token_Session extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'device',
        'initiated_at',
        'expires_at',
        'refresh_expires_at',
        'is_revoked',
    ];


    public function isAccessTokenExpired()
    {
        return Carbon::now()->greaterThan($this->expires_at);
    }

    public function isRefreshTokenExpired()
    {
        return Carbon::now()->greaterThan($this->refresh_expires_at);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}