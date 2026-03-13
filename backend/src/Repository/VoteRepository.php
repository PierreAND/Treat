<?php
namespace App\Repository;

use App\Entity\Activity;
use App\Entity\User;
use App\Entity\Vote;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class VoteRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Vote::class);
    }

    public function findByActivity(Activity $activity): array
    {
        return $this->findBy(['activity' => $activity]);
    }

    public function findByActivityAndVoter(Activity $activity, User $voter): array
    {
        return $this->findBy(['activity' => $activity, 'voter' => $voter]);
    }

    public function hasVoted(Activity $activity, User $voter): bool
    {
        return count($this->findByActivityAndVoter($activity, $voter)) > 0;
    }

    public function findAllReceivedByUser(User $user): array
    {
        return $this->findBy(['target' => $user]);
    }
}