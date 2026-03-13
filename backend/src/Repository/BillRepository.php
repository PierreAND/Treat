<?php
namespace App\Repository;

use App\Entity\Activity;
use App\Entity\Bill;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class BillRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Bill::class);
    }

    public function findByActivity(Activity $activity): ?Bill
    {
        return $this->findOneBy(['activity' => $activity]);
    }

    public function existsForActivity(Activity $activity): bool
    {
        return $this->findByActivity($activity) !== null;
    }
}