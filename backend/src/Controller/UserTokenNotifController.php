<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class UserTokenNotifController extends AbstractController
{
    #[Route('/api/user/push-token', name: 'user_push_token', methods: ['POST'])]
    public function savePushToken(Request $request, EntityManagerInterface $em): JsonResponse
    {
         /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        if (!$data['token']) {
            return $this->json(['message' => 'Token requis'], 400);
        }

        $user->setExpoPushToken($data['token']);
        $em->flush();

        return $this->json(['message' => 'Token enregistré']);
    }
}