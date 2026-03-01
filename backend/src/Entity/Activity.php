<?php

namespace App\Entity;

use App\Repository\ActivityRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ActivityRepository::class)]
class Activity
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(length: 100)]
    private ?string $theme = null;

    #[ORM\Column(length: 50)]
    private ?string $status = 'pending';

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $creator = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\OneToMany(mappedBy: 'activity', targetEntity: Rule::class, cascade: ['persist', 'remove'])]
    private Collection $rules;

    #[ORM\OneToMany(mappedBy: 'activity', targetEntity: ActivityMember::class, cascade: ['persist', 'remove'])]
    private Collection $members;

    #[ORM\OneToMany(mappedBy: 'activity', targetEntity: Vote::class, cascade: ['remove'])]
    private Collection $votes;

    public function __construct()
    {
        $this->rules = new ArrayCollection();
        $this->members = new ArrayCollection();
        $this->votes = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getName(): ?string { return $this->name; }
    public function setName(string $name): static { $this->name = $name; return $this; }

    public function getTheme(): ?string { return $this->theme; }
    public function setTheme(string $theme): static { $this->theme = $theme; return $this; }

    public function getStatus(): ?string { return $this->status; }
    public function setStatus(string $status): static { $this->status = $status; return $this; }

    public function getCreator(): ?User { return $this->creator; }
    public function setCreator(?User $creator): static { $this->creator = $creator; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }

    public function getRules(): Collection { return $this->rules; }
    public function getMembers(): Collection { return $this->members; }
    public function getVotes(): Collection { return $this->votes; }
}