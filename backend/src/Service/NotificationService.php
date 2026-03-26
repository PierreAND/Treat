<?php

namespace App\Service;

use App\Entity\User;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class NotificationService
{
    public function __construct(private HttpClientInterface $httpClient) {}

    public function send(User $user, string $title, string $body, array $data = []): void
    {
        $token = $user->getExpoPushToken();
        if (!$token) return;

        $this->httpClient->request('POST', 'https://exp.host/--/api/v2/push/send', [
            'json' => [
                'to' => $token,
                'title' => $title,
                'body' => $body,
                'data' => $data,
                'sound' => 'default',
            ],
        ]);
    }
}