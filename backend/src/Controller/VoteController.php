<?php

namespace App\Controller;

use App\Entity\Activity;
use App\Entity\ActivityMember;
use App\Entity\Vote;
use App\Entity\Rule;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/activities/{activityId}/votes')]
class VoteController extends AbstractController
{
    #[Route('', name: 'vote_submit', methods: ['POST'])]
    public function submit(int $activityId, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $voter = $this->getUser();
        $activity = $em->getRepository(Activity::class)->find($activityId);

        if (!$activity || $activity->getStatus() !== 'voting') {
            return $this->json(['message' => 'Vote non disponible'], 400);
        }

       
        $existingVotes = $em->getRepository(Vote::class)->findBy([
            'activity' => $activity,
            'voter' => $voter,
        ]);

        if (count($existingVotes) > 0) {
            return $this->json(['message' => 'Tu as déjà voté pour cette activité'], 409);
        }

        $data = json_decode($request->getContent(), true);

        foreach ($data['votes'] as $voteData) {
            $target = $em->getRepository(\App\Entity\User::class)->find($voteData['targetId']);
            $rule = $em->getRepository(Rule::class)->find($voteData['ruleId']);

            if (!$target || !$rule) continue;
            if ($target === $voter) continue;

            $vote = new Vote();
            $vote->setVoter($voter);
            $vote->setTarget($target);
            $vote->setActivity($activity);
            $vote->setRule($rule);
            $em->persist($vote);
        }

        $em->flush();

        return $this->json(['message' => 'Votes enregistrés'], 201);
    }

    #[Route('/status', name: 'vote_status', methods: ['GET'])]
    public function status(int $activityId, EntityManagerInterface $em): JsonResponse
    {
        $voter = $this->getUser();
        $activity = $em->getRepository(Activity::class)->find($activityId);

        if (!$activity) {
            return $this->json(['message' => 'Activité introuvable'], 404);
        }

        $existingVotes = $em->getRepository(Vote::class)->findBy([
            'activity' => $activity,
            'voter' => $voter,
        ]);

        return $this->json([
            'hasVoted' => count($existingVotes) > 0,
        ]);
    }

    #[Route('/results', name: 'vote_results', methods: ['GET'])]
    public function results(int $activityId, EntityManagerInterface $em): JsonResponse
    {
        $activity = $em->getRepository(Activity::class)->find($activityId);
        $votes = $em->getRepository(Vote::class)->findBy(['activity' => $activity]);

        $scores = [];
        foreach ($votes as $vote) {
            $targetId = $vote->getTarget()->getId();
            if (!isset($scores[$targetId])) {
                $scores[$targetId] = [
                    'userId' => $targetId,
                    'username' => $vote->getTarget()->getUsername(),
                    'score' => 0,
                    'details' => [],
                ];
            }
            $scores[$targetId]['score'] += $vote->getRule()->getPoints();
            $scores[$targetId]['details'][] = [
                'rule' => $vote->getRule()->getName(),
                'points' => $vote->getRule()->getPoints(),
                'from' => $vote->getVoter()->getUsername(),
            ];
        }

        usort($scores, fn($a, $b) => $b['score'] <=> $a['score']);

        foreach ($scores as $i => &$s) {
            $s['rank'] = $i + 1;
        }

        return $this->json(array_values($scores));
    }
    #[Route('/check', name: 'vote_check_all', methods: ['GET'])]
public function checkAllVoted(int $activityId, EntityManagerInterface $em): JsonResponse
{
    $activity = $em->getRepository(Activity::class)->find($activityId);

    if (!$activity) {
        return $this->json(['message' => 'Activité introuvable'], 404);
    }

    $members = $em->getRepository(ActivityMember::class)->findBy([
        'activity' => $activity,
        'status' => 'accepted',
    ]);

    $allVoted = true;
    $votedCount = 0;
    $totalCount = count($members);

    foreach ($members as $member) {
        $votes = $em->getRepository(Vote::class)->findBy([
            'activity' => $activity,
            'voter' => $member->getUser(),
        ]);

        if (count($votes) > 0) {
            $votedCount++;
        } else {
            $allVoted = false;
        }
    }

    return $this->json([
        'allVoted' => $allVoted,
        'votedCount' => $votedCount,
        'totalCount' => $totalCount,
    ]);
}

}
