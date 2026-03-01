<?php

namespace App\Entity;

use App\Repository\RuleRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: RuleRepository::class)]
class Rule
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(length: 50)]
    private ?string $type = null; 

    #[ORM\Column]
    private ?int $points = null;

    #[ORM\Column]
    private bool $isDefault = false;

    #[ORM\ManyToOne(targetEntity: Activity::class, inversedBy: 'rules')]
    #[ORM\JoinColumn(nullable: true)]
    private ?Activity $activity = null;

    public function getId(): ?int { return $this->id; }

    public function getName(): ?string { return $this->name; }
    public function setName(string $name): static { $this->name = $name; return $this; }

    public function getType(): ?string { return $this->type; }
    public function setType(string $type): static { $this->type = $type; return $this; }

    public function getPoints(): ?int { return $this->points; }
    public function setPoints(int $points): static { $this->points = $points; return $this; }

    public function isDefault(): bool { return $this->isDefault; }
    public function setIsDefault(bool $isDefault): static { $this->isDefault = $isDefault; return $this; }

    public function getActivity(): ?Activity { return $this->activity; }
    public function setActivity(?Activity $activity): static { $this->activity = $activity; return $this; }
}