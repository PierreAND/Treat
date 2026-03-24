<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/password')]
class PasswordResetController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private MailerInterface $mailer,
        private UserPasswordHasherInterface $hasher,
    ) {}

    #[Route('/forgot', name: 'password_forgot', methods: ['POST'])]
    public function forgot(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $user = $this->em->getRepository(User::class)->findOneBy(['email' => $data['email']]);

        if (!$user) {
            return $this->json(['message' => 'Si cet email existe, un lien a été envoyé']);
        }

        $token = bin2hex(random_bytes(32));
        $user->setResetToken($token);
        $user->setResetTokenExpiresAt(new \DateTimeImmutable('+1 hour'));
        $this->em->flush();

        $resetUrl = $_ENV['FRONTEND_URL'] . '/reset-password?token=' . $token;

        $email = (new Email())
            ->from('noreply@tonapp.com')
            ->to($user->getEmail())
            ->subject('Réinitialisation de ton mot de passe')
            ->html("
                <h2>Réinitialisation de mot de passe</h2>
                <p>Clique sur le lien ci-dessous pour réinitialiser ton mot de passe :</p>
                <a href='{$resetUrl}'>Réinitialiser mon mot de passe</a>
                <p>Ce lien expire dans 1 heure.</p>
            ");

        $this->mailer->send($email);

        return $this->json(['message' => 'Si cet email existe, un lien a été envoyé']);
    }

    #[Route('/reset', name: 'password_reset', methods: ['POST'])]
    public function reset(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['token']) || !isset($data['password'])) {
            return $this->json(['message' => 'Token et mot de passe requis'], 400);
        }

        $user = $this->em->getRepository(User::class)->findOneBy(['resetToken' => $data['token']]);

        if (!$user) {
            return $this->json(['message' => 'Token invalide'], 400);
        }

        if ($user->getResetTokenExpiresAt() < new \DateTimeImmutable()) {
            return $this->json(['message' => 'Token expiré'], 400);
        }

        $user->setPassword($this->hasher->hashPassword($user, $data['password']));
        $user->setResetToken(null);
        $user->setResetTokenExpiresAt(null);
        $this->em->flush();

        return $this->json(['message' => 'Mot de passe réinitialisé avec succès']);
    }
}
