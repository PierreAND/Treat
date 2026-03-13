<?php
namespace App\Controller;

use App\Entity\User;
use App\Repository\ActivityMemberRepository;
use App\Repository\VoteRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/users')]
class ProfileController extends AbstractController
{
    public function __construct(
        private VoteRepository $voteRepository,
        private ActivityMemberRepository $activityMemberRepository,
    ) {}

    #[Route('/{username}/profile', name: 'user_profile', methods: ['GET'])]
    public function getProfile(string $username, EntityManagerInterface $em): JsonResponse
    {
        $user = $em->getRepository(User::class)->findOneBy(['username' => $username]);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur introuvable'], 404);
        }

        $votes = $this->voteRepository->findAllReceivedByUser($user);

        $totalPoints = 0;
        $bonusReceived = 0;
        $malusReceived = 0;

        foreach ($votes as $vote) {
            $points = $vote->getRule()->getPoints();
            $totalPoints += $points;
            if ($points > 0) $bonusReceived++;
            else $malusReceived++;
        }

        $totalVotes = count($votes);
        $reputationScore = $totalVotes > 0
            ? (int) max(0, min(100, 50 + ($totalPoints / $totalVotes) * 10))
            : 50;

        return $this->json([
            'username' => $username,
            'totalActivities' => $this->activityMemberRepository->countByUser($user),
            'totalPoints' => $totalPoints,
            'bonusReceived' => $bonusReceived,
            'malusReceived' => $malusReceived,
            'reputationScore' => $reputationScore,
        ]);
    }
}