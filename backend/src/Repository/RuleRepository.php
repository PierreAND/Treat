<?php
namespace App\Repository;

use App\Entity\Activity;
use App\Entity\Rule;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class RuleRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Rule::class);
    }

    public function createRule(Activity $activity, string $name, string $type, int $points): Rule
    {
        $rule = new Rule();
        $rule->setName($name);
        $rule->setType($type);
        $rule->setPoints($type === 'malus' ? -abs($points) : abs($points));
        $rule->setIsDefault(false);
        $rule->setActivity($activity);

        $em = $this->getEntityManager();
        $em->persist($rule);
        $em->flush();

        return $rule;
    }
}