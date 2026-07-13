<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\HospitalizationRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: HospitalizationRepository::class)]
#[ORM\Table(name: 'hospitalization')]
class Hospitalization
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Patient::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?Patient $patient = null;

    #[ORM\Column(length: 255)]
    private ?string $ward = null;

    #[ORM\Column(length: 20)]
    private ?string $room = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    private ?\DateTimeImmutable $admissionDate = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $dischargeDate = null;

    #[ORM\Column(length: 20)]
    private ?string $status = 'En cours';

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $reason = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $notes = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPatient(): ?Patient
    {
        return $this->patient;
    }

    public function setPatient(?Patient $patient): static
    {
        $this->patient = $patient;
        return $this;
    }

    public function getWard(): ?string
    {
        return $this->ward;
    }

    public function setWard(string $ward): static
    {
        $this->ward = $ward;
        return $this;
    }

    public function getRoom(): ?string
    {
        return $this->room;
    }

    public function setRoom(string $room): static
    {
        $this->room = $room;
        return $this;
    }

    public function getAdmissionDate(): ?\DateTimeImmutable
    {
        return $this->admissionDate;
    }

    public function setAdmissionDate(\DateTimeImmutable $admissionDate): static
    {
        $this->admissionDate = $admissionDate;
        return $this;
    }

    public function getDischargeDate(): ?\DateTimeImmutable
    {
        return $this->dischargeDate;
    }

    public function setDischargeDate(?\DateTimeImmutable $dischargeDate): static
    {
        $this->dischargeDate = $dischargeDate;
        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        return $this;
    }

    public function getReason(): ?string
    {
        return $this->reason;
    }

    public function setReason(?string $reason): static
    {
        $this->reason = $reason;
        return $this;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): static
    {
        $this->notes = $notes;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'patientId' => $this->patient?->getId(),
            'patientName' => $this->patient ? $this->patient->getFirstName() . ' ' . $this->patient->getLastName() : null,
            'ward' => $this->ward,
            'room' => $this->room,
            'admissionDate' => $this->admissionDate?->format('Y-m-d'),
            'dischargeDate' => $this->dischargeDate?->format('Y-m-d'),
            'status' => $this->status,
            'reason' => $this->reason,
            'notes' => $this->notes,
            'createdAt' => $this->createdAt?->format('c'),
        ];
    }
}
