<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Exam;
use App\Entity\Patient;
use App\Service\NotificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/exams')]
class ExamController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly NotificationService $notificationService,
    ) {}

    #[Route('', name: 'exam_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $exams = $this->em->getRepository(Exam::class)->findBy(
            [],
            ['date' => 'DESC']
        );

        return $this->json([
            'exams' => array_map(
                fn(Exam $e) => $e->toArray(),
                $exams
            ),
        ]);
    }

    #[Route('', name: 'exam_create', methods: ['POST'])]
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

        $exam = new Exam();
        $exam->setPatient($patient);
        $exam->setType($data['type']);
        $exam->setDoctor($data['doctor']);
        $exam->setDate($date);
        $exam->setStatus($data['status'] ?? 'En attente');
        $exam->setResult($data['result'] ?? null);
        $exam->setNotes($data['notes'] ?? null);

        $this->em->persist($exam);
        $this->em->flush();

        if (!empty($data['result'])) {
            $this->notificationService->notifyExamResult(
                $patient->getFirstName() . ' ' . $patient->getLastName(),
                $data['type'],
                $data['result'],
            );
        }

        return $this->json([
            'message' => 'Examen cree',
            'exam' => $exam->toArray(),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'exam_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $exam = $this->em->getRepository(Exam::class)->find($id);

        if (!$exam) {
            return $this->json(['error' => 'Examen non trouve'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Donnees invalides'], Response::HTTP_BAD_REQUEST);
        }

        if (!empty($data['patientId'])) {
            $patient = $this->em->getRepository(Patient::class)->find($data['patientId']);
            if ($patient) {
                $exam->setPatient($patient);
            }
        }
        if (!empty($data['type'])) {
            $exam->setType($data['type']);
        }
        if (!empty($data['doctor'])) {
            $exam->setDoctor($data['doctor']);
        }
        if (!empty($data['date'])) {
            try {
                $exam->setDate(new \DateTimeImmutable($data['date']));
            } catch (\Exception $e) {
                return $this->json(['error' => 'Date invalide'], Response::HTTP_BAD_REQUEST);
            }
        }
        if (array_key_exists('status', $data)) {
            $exam->setStatus($data['status']);
        }
        if (array_key_exists('result', $data)) {
            $exam->setResult($data['result'] ?: null);
        }
        if (array_key_exists('notes', $data)) {
            $exam->setNotes($data['notes'] ?: null);
        }

        $this->em->flush();

        return $this->json([
            'message' => 'Examen mis a jour',
            'exam' => $exam->toArray(),
        ]);
    }

    #[Route('/{id}', name: 'exam_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $exam = $this->em->getRepository(Exam::class)->find($id);

        if (!$exam) {
            return $this->json(['error' => 'Examen non trouve'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($exam);
        $this->em->flush();

        return $this->json(['message' => 'Examen supprime']);
    }
}
