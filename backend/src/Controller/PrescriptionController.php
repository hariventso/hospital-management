<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Prescription;
use App\Entity\Patient;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/prescriptions')]
class PrescriptionController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly NotificationService $notificationService,
    ) {}

    #[Route('', name: 'prescription_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $prescriptions = $this->em->getRepository(Prescription::class)->findBy(
            [],
            ['date' => 'DESC']
        );

        return $this->json([
            'prescriptions' => array_map(
                fn(Prescription $p) => $p->toArray(),
                $prescriptions
            ),
        ]);
    }

    #[Route('', name: 'prescription_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Donnees invalides'], Response::HTTP_BAD_REQUEST);
        }

        $required = ['patientId', 'medication', 'dosage', 'duration', 'doctor', 'date'];
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

        $prescription = new Prescription();
        $prescription->setPatient($patient);
        $prescription->setMedication($data['medication']);
        $prescription->setDosage($data['dosage']);
        $prescription->setDuration($data['duration']);
        $prescription->setDoctor($data['doctor']);
        $prescription->setDate($date);
        $prescription->setStatus($data['status'] ?? 'Active');
        $prescription->setInstructions($data['instructions'] ?? null);

        $this->em->persist($prescription);
        $this->em->flush();

        $this->notificationService->notifyPrescriptionCreated(
            $patient->getFirstName() . ' ' . $patient->getLastName(),
            $data['medication'],
        );

        return $this->json([
            'message' => 'Prescription creee',
            'prescription' => $prescription->toArray(),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'prescription_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $prescription = $this->em->getRepository(Prescription::class)->find($id);

        if (!$prescription) {
            return $this->json(['error' => 'Prescription non trouvee'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Donnees invalides'], Response::HTTP_BAD_REQUEST);
        }

        if (!empty($data['patientId'])) {
            $patient = $this->em->getRepository(Patient::class)->find($data['patientId']);
            if ($patient) {
                $prescription->setPatient($patient);
            }
        }
        if (!empty($data['medication'])) {
            $prescription->setMedication($data['medication']);
        }
        if (!empty($data['dosage'])) {
            $prescription->setDosage($data['dosage']);
        }
        if (!empty($data['duration'])) {
            $prescription->setDuration($data['duration']);
        }
        if (!empty($data['doctor'])) {
            $prescription->setDoctor($data['doctor']);
        }
        if (!empty($data['date'])) {
            try {
                $prescription->setDate(new \DateTimeImmutable($data['date']));
            } catch (\Exception $e) {
                return $this->json(['error' => 'Date invalide'], Response::HTTP_BAD_REQUEST);
            }
        }
        if (array_key_exists('status', $data)) {
            $prescription->setStatus($data['status']);
        }
        if (array_key_exists('instructions', $data)) {
            $prescription->setInstructions($data['instructions'] ?: null);
        }

        $this->em->flush();

        return $this->json([
            'message' => 'Prescription mise a jour',
            'prescription' => $prescription->toArray(),
        ]);
    }

    #[Route('/{id}', name: 'prescription_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $prescription = $this->em->getRepository(Prescription::class)->find($id);

        if (!$prescription) {
            return $this->json(['error' => 'Prescription non trouvee'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($prescription);
        $this->em->flush();

        return $this->json(['message' => 'Prescription supprimee']);
    }
}
