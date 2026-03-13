<?php
namespace App\Repository;

use App\Entity\Activity;
use App\Entity\ActivityMember;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ActivityMemberRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ActivityMember::class);
    }

    public function findByUser(User $user): array
    {
        return $this->findBy(['user' => $user]);
    }

    public function findAcceptedByActivity(Activity $activity): array
    {
        return $this->findBy(['activity' => $activity, 'status' => 'accepted']);
    }

    public function findByUserAndActivity(User $user, Activity $activity): ?ActivityMember
    {
        return $this->findOneBy(['user' => $user, 'activity' => $activity]);
    }

    public function countByUser(User $user): int
    {
        return $this->createQueryBuilder('m')
            ->select('COUNT(m.id)')
            ->where('m.user = :user')
            ->andWhere('m.status = :status')
            ->setParameter('user', $user)
            ->setParameter('status', 'accepted')
            ->getQuery()
            ->getSingleScalarResult();
    }
}