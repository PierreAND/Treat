<?php

namespace App\Entity;

use App\Repository\VoteRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: VoteRepository::class)]
class Vote
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $voter = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $target = null;

    #[ORM\ManyToOne(targetEntity: Activity::class, inversedBy: 'votes')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Activity $activity = null;

    #[ORM\ManyToOne(targetEntity: Rule::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Rule $rule = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getVoter(): ?User { return $this->voter; }
    public function setVoter(?User $voter): static { $this->voter = $voter; return $this; }

    public function getTarget(): ?User { return $this->target; }
    public function setTarget(?User $target): static { $this->target = $target; return $this; }

    public function getActivity(): ?Activity { return $this->activity; }
    public function setActivity(?Activity $activity): static { $this->activity = $activity; return $this; }

    public function getRule(): ?Rule { return $this->rule; }
    public function setRule(?Rule $rule): static { $this->rule = $rule; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
}