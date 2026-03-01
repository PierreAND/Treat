<?php

namespace App\Entity;

use App\Repository\BillShareRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: BillShareRepository::class)]
class BillShare
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Bill::class, inversedBy: 'shares')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Bill $bill = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column]
    private ?int $voteScore = null;

    #[ORM\Column]
    private ?int $rank = null;

    #[ORM\Column]
    private ?float $percentage = null;

    #[ORM\Column]
    private ?float $amount = null;

    public function getId(): ?int { return $this->id; }

    public function getBill(): ?Bill { return $this->bill; }
    public function setBill(?Bill $bill): static { $this->bill = $bill; return $this; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }

    public function getVoteScore(): ?int { return $this->voteScore; }
    public function setVoteScore(int $voteScore): static { $this->voteScore = $voteScore; return $this; }

    public function getRank(): ?int { return $this->rank; }
    public function setRank(int $rank): static { $this->rank = $rank; return $this; }

    public function getPercentage(): ?float { return $this->percentage; }
    public function setPercentage(float $percentage): static { $this->percentage = $percentage; return $this; }

    public function getAmount(): ?float { return $this->amount; }
    public function setAmount(float $amount): static { $this->amount = $amount; return $this; }
}