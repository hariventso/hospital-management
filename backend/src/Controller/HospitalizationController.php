<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Hospitalization;
use App\Entity\Patient;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/hospitalizations')]
class HospitalizationController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly NotificationService $notificationService,
    ) {}

    #[Route('', name: 'hospitalization_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $hospitalizations = $this->em->getRepository(Hospitalization::class)->findBy(
            [],
            ['admissionDate' => 'DESC']
        );

        return $this->json([
            'hospitalizations' => array_map(
                fn(Hospitalization $h) => $h->toArray(),
                $hospitalizations
            ),
        ]);
    }

    #[Route('', name: 'hospitalization_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Donnees invalides'], Response::HTTP_BAD_REQUEST);
        }

        $required = ['patientId', 'ward', 'room', 'admissionDate'];
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
            $admissionDate = new \DateTimeImmutable($data['admissionDate']);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Date d\'admission invalide'], Response::HTTP_BAD_REQUEST);
        }

        $hospitalization = new Hospitalization();
        $hospitalization->setPatient($patient);
        $hospitalization->setWard($data['ward']);
        $hospitalization->setRoom($data['room']);
        $hospitalization->setAdmissionDate($admissionDate);
        $hospitalization->setStatus($data['status'] ?? 'En cours');
        $hospitalization->setReason($data['reason'] ?? null);
        $hospitalization->setNotes($data['notes'] ?? null);

        if (!empty($data['dischargeDate'])) {
            try {
                $hospitalization->setDischargeDate(new \DateTimeImmutable($data['dischargeDate']));
            } catch (\Exception $e) {
                return $this->json(['error' => 'Date de sortie invalide'], Response::HTTP_BAD_REQUEST);
            }
        }

        $this->em->persist($hospitalization);
        $this->em->flush();

        $this->notificationService->notifyHospitalizationCreated(
            $patient->getFirstName() . ' ' . $patient->getLastName(),
            $data['ward'],
            $data['room'],
        );

        return $this->json([
            'message' => 'Hospitalisation creee',
            'hospitalization' => $hospitalization->toArray(),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'hospitalization_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $hospitalization = $this->em->getRepository(Hospitalization::class)->find($id);

        if (!$hospitalization) {
            return $this->json(['error' => 'Hospitalisation non trouvee'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Donnees invalides'], Response::HTTP_BAD_REQUEST);
        }

        if (!empty($data['patientId'])) {
            $patient = $this->em->getRepository(Patient::class)->find($data['patientId']);
            if ($patient) {
                $hospitalization->setPatient($patient);
            }
        }
        if (!empty($data['ward'])) {
            $hospitalization->setWard($data['ward']);
        }
        if (!empty($data['room'])) {
            $hospitalization->setRoom($data['room']);
        }
        if (!empty($data['admissionDate'])) {
            try {
                $hospitalization->setAdmissionDate(new \DateTimeImmutable($data['admissionDate']));
            } catch (\Exception $e) {
                return $this->json(['error' => 'Date d\'admission invalide'], Response::HTTP_BAD_REQUEST);
            }
        }
        if (array_key_exists('dischargeDate', $data)) {
            if ($data['dischargeDate']) {
                try {
                    $hospitalization->setDischargeDate(new \DateTimeImmutable($data['dischargeDate']));
                } catch (\Exception $e) {
                    return $this->json(['error' => 'Date de sortie invalide'], Response::HTTP_BAD_REQUEST);
                }
            } else {
                $hospitalization->setDischargeDate(null);
            }
        }
        if (array_key_exists('status', $data)) {
            $hospitalization->setStatus($data['status']);
        }
        if (array_key_exists('reason', $data)) {
            $hospitalization->setReason($data['reason'] ?: null);
        }
        if (array_key_exists('notes', $data)) {
            $hospitalization->setNotes($data['notes'] ?: null);
        }

        $this->em->flush();

        return $this->json([
            'message' => 'Hospitalisation mise a jour',
            'hospitalization' => $hospitalization->toArray(),
        ]);
    }

    #[Route('/{id}', name: 'hospitalization_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $hospitalization = $this->em->getRepository(Hospitalization::class)->find($id);

        if (!$hospitalization) {
            return $this->json(['error' => 'Hospitalisation non trouvee'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($hospitalization);
        $this->em->flush();

        return $this->json(['message' => 'Hospitalisation supprimee']);
    }
}
