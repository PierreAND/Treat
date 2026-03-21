<?php
namespace App\Repository;
use App\Entity\BillShare;
use App\Entity\User;
use App\Entity\Activity;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class BillShareRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, BillShare::class);
    }
    public function deleteByUserAndActivity(User $user, Activity $activity): void
{
    $this->getEntityManager()->createQuery(
        'DELETE FROM App\Entity\BillShare bs WHERE bs.user = :user AND bs.bill IN (
            SELECT b.id FROM App\Entity\Bill b WHERE b.activity = :activity
        )'
    )
    ->setParameter('user', $user)
    ->setParameter('activity', $activity)
    ->execute();
}
}