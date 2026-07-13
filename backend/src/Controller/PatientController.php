<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Patient;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/patients')]
class PatientController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
    ) {}

    #[Route('', name: 'patient_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $patients = $this->em->getRepository(Patient::class)->findBy(
            [],
            ['createdAt' => 'DESC']
        );

        return $this->json([
            'patients' => array_map(
                fn(Patient $p) => $p->toArray(),
                $patients
            ),
        ]);
    }

    #[Route('', name: 'patient_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Donnees invalides'], Response::HTTP_BAD_REQUEST);
        }

        $required = ['lastName', 'firstName', 'gender'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return $this->json(
                    ['error' => "Le champ '$field' est obligatoire"],
                    Response::HTTP_BAD_REQUEST
                );
            }
        }

        $patient = new Patient();
        $patient->setLastName($data['lastName']);
        $patient->setFirstName($data['firstName']);
        $patient->setGender($data['gender']);

        if (!empty($data['dateOfBirth'])) {
            try {
                $patient->setDateOfBirth(new \DateTimeImmutable($data['dateOfBirth']));
            } catch (\Exception $e) {
                return $this->json(['error' => 'Date de naissance invalide'], Response::HTTP_BAD_REQUEST);
            }
        }

        $patient->setPhone($data['phone'] ?? null);
        $patient->setEmail($data['email'] ?? null);
        $patient->setAddress($data['address'] ?? null);

        $this->em->persist($patient);
        $this->em->flush();

        return $this->json([
            'message' => 'Patient cree avec succes',
            'patient' => $patient->toArray(),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'patient_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $patient = $this->em->getRepository(Patient::class)->find($id);

        if (!$patient) {
            return $this->json(['error' => 'Patient non trouve'], Response::HTTP_NOT_FOUND);
        }

        return $this->json(['patient' => $patient->toArray()]);
    }

    #[Route('/{id}', name: 'patient_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $patient = $this->em->getRepository(Patient::class)->find($id);

        if (!$patient) {
            return $this->json(['error' => 'Patient non trouve'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Donnees invalides'], Response::HTTP_BAD_REQUEST);
        }

        if (!empty($data['lastName'])) {
            $patient->setLastName($data['lastName']);
        }
        if (!empty($data['firstName'])) {
            $patient->setFirstName($data['firstName']);
        }
        if (!empty($data['gender'])) {
            $patient->setGender($data['gender']);
        }
        if (array_key_exists('dateOfBirth', $data)) {
            if ($data['dateOfBirth']) {
                try {
                    $patient->setDateOfBirth(new \DateTimeImmutable($data['dateOfBirth']));
                } catch (\Exception $e) {
                    return $this->json(['error' => 'Date de naissance invalide'], Response::HTTP_BAD_REQUEST);
                }
            } else {
                $patient->setDateOfBirth(null);
            }
        }
        if (array_key_exists('phone', $data)) {
            $patient->setPhone($data['phone'] ?: null);
        }
        if (array_key_exists('email', $data)) {
            $patient->setEmail($data['email'] ?: null);
        }
        if (array_key_exists('address', $data)) {
            $patient->setAddress($data['address'] ?: null);
        }

        $this->em->flush();

        return $this->json([
            'message' => 'Patient mis a jour',
            'patient' => $patient->toArray(),
        ]);
    }

    #[Route('/{id}', name: 'patient_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $patient = $this->em->getRepository(Patient::class)->find($id);

        if (!$patient) {
            return $this->json(['error' => 'Patient non trouve'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($patient);
        $this->em->flush();

        return $this->json(['message' => 'Patient supprime']);
    }
}
