<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Appointment;
use App\Entity\Patient;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/appointments')]
class AppointmentController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
    ) {}

    #[Route('', name: 'appointment_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $appointments = $this->em->getRepository(Appointment::class)->findBy(
            [],
            ['date' => 'ASC', 'time' => 'ASC']
        );

        return $this->json([
            'appointments' => array_map(
                fn(Appointment $a) => $a->toArray(),
                $appointments
            ),
        ]);
    }

    #[Route('', name: 'appointment_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Donnees invalides'], Response::HTTP_BAD_REQUEST);
        }

        $required = ['patientId', 'doctor', 'type', 'date', 'time'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return $this->json(
                    ['error' => "Le champ '$field' est obligatoire"],
                    Response::HTTP_BAD_REQUEST
                );
            }
        }

        $patient = $this->em->getRepository(Patient::class)->find($data['patientId']);
        if (!$patient) {
            return $this->json(['error' => 'Patient non trouve'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $date = new \DateTimeImmutable($data['date']);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Date invalide'], Response::HTTP_BAD_REQUEST);
        }

        $appointment = new Appointment();
        $appointment->setPatient($patient);
        $appointment->setDoctor($data['doctor']);
        $appointment->setType($data['type']);
        $appointment->setDate($date);
        $appointment->setTime($data['time']);
        $appointment->setStatus($data['status'] ?? 'En attente');
        $appointment->setNotes($data['notes'] ?? null);

        $this->em->persist($appointment);
        $this->em->flush();

        return $this->json([
            'message' => 'Rendez-vous cree',
            'appointment' => $appointment->toArray(),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'appointment_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $appointment = $this->em->getRepository(Appointment::class)->find($id);

        if (!$appointment) {
            return $this->json(['error' => 'Rendez-vous non trouve'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Donnees invalides'], Response::HTTP_BAD_REQUEST);
        }

        if (!empty($data['patientId'])) {
            $patient = $this->em->getRepository(Patient::class)->find($data['patientId']);
            if ($patient) {
                $appointment->setPatient($patient);
            }
        }
        if (!empty($data['doctor'])) {
            $appointment->setDoctor($data['doctor']);
        }
        if (!empty($data['type'])) {
            $appointment->setType($data['type']);
        }
        if (!empty($data['date'])) {
            try {
                $appointment->setDate(new \DateTimeImmutable($data['date']));
            } catch (\Exception $e) {
                return $this->json(['error' => 'Date invalide'], Response::HTTP_BAD_REQUEST);
            }
        }
        if (!empty($data['time'])) {
            $appointment->setTime($data['time']);
        }
        if (array_key_exists('status', $data)) {
            $appointment->setStatus($data['status']);
        }
        if (array_key_exists('notes', $data)) {
            $appointment->setNotes($data['notes'] ?: null);
        }

        $this->em->flush();

        return $this->json([
            'message' => 'Rendez-vous mis a jour',
            'appointment' => $appointment->toArray(),
        ]);
    }

    #[Route('/{id}', name: 'appointment_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $appointment = $this->em->getRepository(Appointment::class)->find($id);

        if (!$appointment) {
            return $this->json(['error' => 'Rendez-vous non trouve'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($appointment);
        $this->em->flush();

        return $this->json(['message' => 'Rendez-vous supprime']);
    }
}
