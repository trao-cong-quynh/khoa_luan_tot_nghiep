<?php

namespace App\Constants;

enum ShowTimeStatus: string
{

    case UPCOMING = 'upcoming';
    case NOW_SHOWING = 'now showing';
    case FINISHED = 'finished';
    case CANCELLED = 'cancelled';
    case HIDDEN = 'hidden';
    case FULL = 'full';


    public static function canTransition(self $from, self $to): bool
    {
        return match ($from) {
            self::UPCOMING => in_array($to, [self::NOW_SHOWING, self::CANCELLED, self::HIDDEN, self::FULL]),
            self::NOW_SHOWING => in_array($to, [self::FINISHED, self::CANCELLED, self::FULL]),
            self::FULL => in_array($to, [self::NOW_SHOWING, self::FINISHED]),
            self::HIDDEN => in_array($to, [self::UPCOMING, self::CANCELLED]),
            self::CANCELLED => in_array($to, [self::UPCOMING]),
            self::FINISHED => false,
        };
    }

}
