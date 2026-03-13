<?php
namespace App\Controller;

use App\Entity\Activity;
use App\Entity\Bill;
use App\Entity\BillShare;
use App\Repository\ActivityMemberRepository;
use App\Repository\BillRepository;
use App\Repository\VoteRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/activities/{activityId}/bill')]
class BillController extends AbstractController
{
    public function __construct(
        private BillRepository $billRepository,
        private VoteRepository $voteRepository,
        private ActivityMemberRepository $activityMemberRepository,
    ) {}

    #[Route('', name: 'bill_create', methods: ['POST'])]
    public function create(int $activityId, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $activity = $em->getRepository(Activity::class)->find($activityId);

        if (!$activity || $activity->getStatus() !== 'voting') {
            return $this->json(['message' => 'L\'activité n\'est pas en phase de vote'], 400);
        }

        $members = $this->activityMemberRepository->findAcceptedByActivity($activity);

        foreach ($members as $member) {
            if (!$this->voteRepository->hasVoted($activity, $member->getUser())) {
                return $this->json(['message' => 'Tous les membres n\'ont pas encore voté'], 400);
            }
        }

        if ($this->billRepository->existsForActivity($activity)) {
            return $this->json(['message' => 'Une note existe déjà pour cette activité'], 409);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data['totalAmount'] || !$data['drinkType']) {
            return $this->json(['message' => 'Montant et type de boisson requis'], 400);
        }

        $votes = $this->voteRepository->findByActivity($activity);

        $scores = [];
        foreach ($members as $member) {
            $userId = $member->getUser()->getId();
            $scores[$userId] = [
                'user' => $member->getUser(),
                'score' => 0,
            ];
        }

        foreach ($votes as $vote) {
            $targetId = $vote->getTarget()->getId();
            if (isset($scores[$targetId])) {
                $scores[$targetId]['score'] += $vote->getRule()->getPoints();
            }
        }

        usort($scores, fn($a, $b) => $b['score'] <=> $a['score']);

        $nbMembers = count($scores);
        $totalWeight = 0;
        $weights = [];

        for ($i = 0; $i < $nbMembers; $i++) {
            $weight = $i + 1;
            $weights[] = $weight;
            $totalWeight += $weight;
        }

        $bill = new Bill();
        $bill->setActivity($activity);
        $bill->setTotalAmount($data['totalAmount']);
        $bill->setDrinkType($data['drinkType']);
        $em->persist($bill);

        $shares = [];
        foreach ($scores as $i => $scoreData) {
            $percentage = round(($weights[$i] / $totalWeight) * 100, 2);
            $amount = round(($weights[$i] / $totalWeight) * $data['totalAmount'], 2);

            $share = new BillShare();
            $share->setBill($bill);
            $share->setUser($scoreData['user']);
            $share->setVoteScore($scoreData['score']);
            $share->setRank($i + 1);
            $share->setPercentage($percentage);
            $share->setAmount($amount);
            $em->persist($share);

            $shares[] = [
                'username' => $scoreData['user']->getUsername(),
                'score' => $scoreData['score'],
                'rank' => $i + 1,
                'percentage' => $percentage,
                'amount' => $amount,
            ];
        }

        $activity->setStatus('finished');
        $em->flush();

        return $this->json([
            'totalAmount' => $data['totalAmount'],
            'drinkType' => $data['drinkType'],
            'shares' => $shares,
        ], 201);
    }

    #[Route('', name: 'bill_show', methods: ['GET'])]
    public function show(int $activityId, EntityManagerInterface $em): JsonResponse
    {
        $activity = $em->getRepository(Activity::class)->find($activityId);
        $bill = $this->billRepository->findByActivity($activity);

        if (!$bill) {
            return $this->json(['message' => 'Pas de note pour cette activité'], 404);
        }

        $shares = array_map(fn(BillShare $s) => [
            'username' => $s->getUser()->getUsername(),
            'score' => $s->getVoteScore(),
            'rank' => $s->getRank(),
            'percentage' => $s->getPercentage(),
            'amount' => $s->getAmount(),
        ], $bill->getShares()->toArray());

        usort($shares, fn($a, $b) => $a['rank'] <=> $b['rank']);

        return $this->json([
            'totalAmount' => $bill->getTotalAmount(),
            'drinkType' => $bill->getDrinkType(),
            'shares' => $shares,
        ]);
    }
}