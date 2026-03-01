<?php

namespace App\Controller;

use App\Entity\Activity;
use App\Entity\ActivityMember;
use App\Entity\Rule;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/activities')]
class ActivityController extends AbstractController
{
    #[Route('', name: 'activity_list', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();

        $activities = $em->getRepository(ActivityMember::class)->findBy(['user' => $user]);

        $data = array_map(fn(ActivityMember $m) => [
            'id' => $m->getActivity()->getId(),
            'name' => $m->getActivity()->getName(),
            'theme' => $m->getActivity()->getTheme(),
            'status' => $m->getActivity()->getStatus(),
            'creator' => $m->getActivity()->getCreator()->getUsername(),
            'memberStatus' => $m->getStatus(),
            'createdAt' => $m->getActivity()->getCreatedAt()->format('Y-m-d H:i:s'),
        ], $activities);

        return $this->json($data);
    }

    #[Route('', name: 'activity_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        if (!$data['name'] || !$data['theme']) {
            return $this->json(['message' => 'Nom et thème requis'], 400);
        }

        $activity = new Activity();
        $activity->setName($data['name']);
        $activity->setTheme($data['theme']);
        $activity->setCreator($user);

        $member = new ActivityMember();
        $member->setUser($user);
        $member->setActivity($activity);
        $member->setStatus('accepted');
        $em->persist($member);

        $defaultRules = $this->getDefaultRules($data['theme']);
        foreach ($defaultRules as $ruleData) {
            $rule = new Rule();
            $rule->setName($ruleData['name']);
            $rule->setType($ruleData['type']);
            $rule->setPoints($ruleData['points']);
            $rule->setIsDefault(true);
            $rule->setActivity($activity);
            $em->persist($rule);
        }

        if (isset($data['rules']) && is_array($data['rules'])) {
            foreach ($data['rules'] as $ruleData) {
                $rule = new Rule();
                $rule->setName($ruleData['name']);
                $rule->setType($ruleData['type']);
                $rule->setPoints($ruleData['points']);
                $rule->setIsDefault(false);
                $rule->setActivity($activity);
                $em->persist($rule);
            }
        }

        $em->persist($activity);
        $em->flush();

        return $this->json([
            'id' => $activity->getId(),
            'name' => $activity->getName(),
            'theme' => $activity->getTheme(),
            'status' => $activity->getStatus(),
        ], 201);
    }

    #[Route('/{id}', name: 'activity_show', methods: ['GET'])]
    public function show(Activity $activity, EntityManagerInterface $em): JsonResponse
    {
        $members = array_map(fn(ActivityMember $m) => [
            'id' => $m->getUser()->getId(),
            'username' => $m->getUser()->getUsername(),
            'status' => $m->getStatus(),
        ], $activity->getMembers()->toArray());

        $rules = array_map(fn(Rule $r) => [
            'id' => $r->getId(),
            'name' => $r->getName(),
            'type' => $r->getType(),
            'points' => $r->getPoints(),
            'isDefault' => $r->isDefault(),
        ], $activity->getRules()->toArray());

        return $this->json([
            'id' => $activity->getId(),
            'name' => $activity->getName(),
            'theme' => $activity->getTheme(),
            'status' => $activity->getStatus(),
            'creator' => $activity->getCreator()->getUsername(),
            'members' => $members,
            'rules' => $rules,
            'createdAt' => $activity->getCreatedAt()->format('Y-m-d H:i:s'),
        ]);
    }

    #[Route('/{id}/invite', name: 'activity_invite', methods: ['POST'])]
    public function invite(Activity $activity, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $user = $em->getRepository(\App\Entity\User::class)->findOneBy(['username' => $data['username']]);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur introuvable'], 404);
        }

        $existing = $em->getRepository(ActivityMember::class)->findOneBy([
            'user' => $user,
            'activity' => $activity,
        ]);
        if ($existing) {
            return $this->json(['message' => 'Déjà membre'], 409);
        }

        $member = new ActivityMember();
        $member->setUser($user);
        $member->setActivity($activity);
        $member->setStatus('invited');

        $em->persist($member);
        $em->flush();

        return $this->json(['message' => 'Invitation envoyée'], 201);
    }

    #[Route('/{id}/respond', name: 'activity_respond', methods: ['POST'])]
    public function respond(Activity $activity, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $member = $em->getRepository(ActivityMember::class)->findOneBy([
            'user' => $user,
            'activity' => $activity,
        ]);

        if (!$member || $member->getStatus() !== 'invited') {
            return $this->json(['message' => 'Pas d\'invitation trouvée'], 404);
        }

        $member->setStatus($data['accept'] ? 'accepted' : 'declined');
        $em->flush();

        return $this->json(['message' => $data['accept'] ? 'Acceptée' : 'Refusée']);
    }

    #[Route('/{id}/start', name: 'activity_start', methods: ['POST'])]
    public function start(Activity $activity, EntityManagerInterface $em): JsonResponse
    {
        if ($activity->getCreator() !== $this->getUser()) {
            return $this->json(['message' => 'Seul le créateur peut démarrer'], 403);
        }

        if ($activity->getStatus() !== 'pending') {
            return $this->json(['message' => 'L\'activité ne peut pas être démarrée'], 400);
        }

        $activity->setStatus('active');
        $em->flush();

        return $this->json(['message' => 'Activité démarrée', 'status' => 'active']);
    }

   
    #[Route('/{id}/stop', name: 'activity_stop', methods: ['POST'])]
    public function stop(Activity $activity, EntityManagerInterface $em): JsonResponse
    {
        if ($activity->getCreator() !== $this->getUser()) {
            return $this->json(['message' => 'Seul le créateur peut arrêter'], 403);
        }

        if ($activity->getStatus() !== 'active') {
            return $this->json(['message' => 'L\'activité n\'est pas en cours'], 400);
        }

        $activity->setStatus('voting');
        $em->flush();

        return $this->json(['message' => 'Phase de vote ouverte', 'status' => 'voting']);
    }

    private function getDefaultRules(string $theme): array
    {
        return match ($theme) {
            'sport' => [
                ['name' => 'MVP', 'type' => 'bonus', 'points' => 3],
                ['name' => 'Fair-play', 'type' => 'bonus', 'points' => 2],
                ['name' => 'Beau jeu', 'type' => 'bonus', 'points' => 1],
                ['name' => 'Faute', 'type' => 'malus', 'points' => -2],
                ['name' => 'Mauvais perdant', 'type' => 'malus', 'points' => -3],
            ],
            'sortie' => [
                ['name' => 'Bonne ambiance', 'type' => 'bonus', 'points' => 2],
                ['name' => 'Organisateur', 'type' => 'bonus', 'points' => 2],
                ['name' => 'Retardataire', 'type' => 'malus', 'points' => -1],
                ['name' => 'Rabat-joie', 'type' => 'malus', 'points' => -2],
            ],
            'weekend' => [
                ['name' => 'Cuisinier', 'type' => 'bonus', 'points' => 2],
                ['name' => 'Bonne idée', 'type' => 'bonus', 'points' => 1],
                ['name' => 'Flemmard', 'type' => 'malus', 'points' => -2],
                ['name' => 'Bordélique', 'type' => 'malus', 'points' => -1],
            ],
            default => [
                ['name' => 'Bonne attitude', 'type' => 'bonus', 'points' => 2],
                ['name' => 'Mauvaise attitude', 'type' => 'malus', 'points' => -2],
            ],
        };
    }
}