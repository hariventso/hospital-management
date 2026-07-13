<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\MedicalRecord;
use App\Entity\Patient;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/medical-records')]
class MedicalRecordController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
    ) {}

    #[Route('', name: 'medical_record_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $records = $this->em->getRepository(MedicalRecord::class)->findBy(
            [],
            ['date' => 'DESC']
        );

        return $this->json([
            'records' => array_map(
                fn(MedicalRecord $r) => $r->toArray(),
                $records
            ),
        ]);
    }

    #[Route('', name: 'medical_record_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Donnees invalides'], Response::HTTP_BAD_REQUEST);
        }

        $required = ['patientId', 'type', 'doctor', 'date'];
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

        $record = new MedicalRecord();
        $record->setPatient($patient);
        $record->setType($data['type']);
        $record->setDoctor($data['doctor']);
        $record->setDate($date);
        $record->setStatus($data['status'] ?? 'Valide');
        $record->setDiagnosis($data['diagnosis'] ?? null);
        $record->setTreatment($data['treatment'] ?? null);
        $record->setNotes($data['notes'] ?? null);

        $this->em->persist($record);
        $this->em->flush();

        return $this->json([
            'message' => 'Dossier medical cree',
            'record' => $record->toArray(),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'medical_record_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $record = $this->em->getRepository(MedicalRecord::class)->find($id);

        if (!$record) {
            return $this->json(['error' => 'Dossier non trouve'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Donnees invalides'], Response::HTTP_BAD_REQUEST);
        }

        if (!empty($data['patientId'])) {
            $patient = $this->em->getRepository(Patient::class)->find($data['patientId']);
            if ($patient) {
                $record->setPatient($patient);
            }
        }
        if (!empty($data['type'])) {
            $record->setType($data['type']);
        }
        if (!empty($data['doctor'])) {
            $record->setDoctor($data['doctor']);
        }
        if (!empty($data['date'])) {
            try {
                $record->setDate(new \DateTimeImmutable($data['date']));
            } catch (\Exception $e) {
                return $this->json(['error' => 'Date invalide'], Response::HTTP_BAD_REQUEST);
            }
        }
        if (array_key_exists('status', $data)) {
            $record->setStatus($data['status']);
        }
        if (array_key_exists('diagnosis', $data)) {
            $record->setDiagnosis($data['diagnosis'] ?: null);
        }
        if (array_key_exists('treatment', $data)) {
            $record->setTreatment($data['treatment'] ?: null);
        }
        if (array_key_exists('notes', $data)) {
            $record->setNotes($data['notes'] ?: null);
        }

        $this->em->flush();

        return $this->json([
            'message' => 'Dossier medical mis a jour',
            'record' => $record->toArray(),
        ]);
    }

    #[Route('/{id}', name: 'medical_record_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $record = $this->em->getRepository(MedicalRecord::class)->find($id);

        if (!$record) {
            return $this->json(['error' => 'Dossier non trouve'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($record);
        $this->em->flush();

        return $this->json(['message' => 'Dossier medical supprime']);
    }
}
