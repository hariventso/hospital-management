<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Notification;
use Doctrine\ORM\EntityManagerInterface;

class NotificationService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
    ) {}

    public function create(
        string $title,
        string $message,
        string $type = 'info',
        ?string $link = null,
    ): Notification {
        $notification = new Notification();
        $notification->setTitle($title);
        $notification->setMessage($message);
        $notification->setType($type);
        $notification->setLink($link);

        $this->em->persist($notification);
        $this->em->flush();

        return $notification;
    }

    public function notifyAppointmentCreated(string $patientName, string $doctor, string $date): void
    {
        $this->create(
            'Nouveau rendez-vous',
            "Rendez-vous de $patientName avec Dr. $doctor le $date",
            'info',
            '/dashboard/appointments',
        );
    }

    public function notifyHospitalizationCreated(string $patientName, string $ward, string $room): void
    {
        $this->create(
            'Nouvelle hospitalisation',
            "$patientName a été admis(e) en $ward, chambre $room",
            'warning',
            '/dashboard/hospitalizations',
        );
    }

    public function notifyPrescriptionCreated(string $patientName, string $medication): void
    {
        $this->create(
            'Nouvelle prescription',
            "Prescription de $medication pour $patientName",
            'info',
            '/dashboard/prescriptions',
        );
    }

    public function notifyInvoiceCreated(string $patientName, float $amount): void
    {
        $this->create(
            'Nouvelle facture',
            "Facture de " . number_format($amount, 2, ',', ' ') . " € pour $patientName",
            'warning',
            '/dashboard/billing',
        );
    }

    public function notifyInvoiceOverdue(string $patientName, float $amount): void
    {
        $this->create(
            'Facture en retard',
            "Facture impayée de " . number_format($amount, 2, ',', ' ') . " € pour $patientName",
            'error',
            '/dashboard/billing',
        );
    }

    public function notifyExamResult(string $patientName, string $examType, string $result): void
    {
        $type = $result === 'Normal' ? 'success' : ($result === 'Anormal' ? 'error' : 'warning');
        $this->create(
            'Résultat d\'examen',
            "Résultat $result de l'examen $examType pour $patientName",
            $type,
            '/dashboard/exams',
        );
    }

    public function notifyHospitalizationDischarge(string $patientName, string $ward): void
    {
        $this->create(
            'Sortie d\'hospitalisation',
            "$patientName a quitté le service de $ward",
            'success',
            '/dashboard/hospitalizations',
        );
    }
}
