<?php

namespace App\Enums;

enum UserRole: int
{
    case GUEST = 0;
    case USER = 1;
    case ORGANIZER = 2;
    case ADMIN = 3;
    case CREATOR = 4;
}