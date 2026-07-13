<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Invoice;
use App\Entity\Patient;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/invoices')]
class InvoiceController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
    ) {}

    #[Route('', name: 'invoice_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $invoices = $this->em->getRepository(Invoice::class)->findBy(
            [],
            ['date' => 'DESC']
        );

        return $this->json([
            'invoices' => array_map(
                fn(Invoice $i) => $i->toArray(),
                $invoices
            ),
        ]);
    }

    #[Route('', name: 'invoice_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Donnees invalides'], Response::HTTP_BAD_REQUEST);
        }

        $required = ['patientId', 'type', 'amount', 'date'];
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

        $invoice = new Invoice();
        $invoice->setPatient($patient);
        $invoice->setType($data['type']);
        $invoice->setAmount((string) $data['amount']);
        $invoice->setPaidAmount((string) ($data['paidAmount'] ?? 0));
        $invoice->setDate($date);
        $invoice->setStatus($data['status'] ?? 'En attente');
        $invoice->setDescription($data['description'] ?? null);

        $this->em->persist($invoice);
        $this->em->flush();

        return $this->json([
            'message' => 'Facture creee',
            'invoice' => $invoice->toArray(),
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'invoice_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $invoice = $this->em->getRepository(Invoice::class)->find($id);

        if (!$invoice) {
            return $this->json(['error' => 'Facture non trouvee'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json(['error' => 'Donnees invalides'], Response::HTTP_BAD_REQUEST);
        }

        if (!empty($data['patientId'])) {
            $patient = $this->em->getRepository(Patient::class)->find($data['patientId']);
            if ($patient) {
                $invoice->setPatient($patient);
            }
        }
        if (!empty($data['type'])) {
            $invoice->setType($data['type']);
        }
        if (array_key_exists('amount', $data)) {
            $invoice->setAmount((string) $data['amount']);
        }
        if (array_key_exists('paidAmount', $data)) {
            $invoice->setPaidAmount((string) ($data['paidAmount'] ?? 0));
        }
        if (!empty($data['date'])) {
            try {
                $invoice->setDate(new \DateTimeImmutable($data['date']));
            } catch (\Exception $e) {
                return $this->json(['error' => 'Date invalide'], Response::HTTP_BAD_REQUEST);
            }
        }
        if (array_key_exists('status', $data)) {
            $invoice->setStatus($data['status']);
        }
        if (array_key_exists('description', $data)) {
            $invoice->setDescription($data['description'] ?: null);
        }

        $this->em->flush();

        return $this->json([
            'message' => 'Facture mise a jour',
            'invoice' => $invoice->toArray(),
        ]);
    }

    #[Route('/{id}', name: 'invoice_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $invoice = $this->em->getRepository(Invoice::class)->find($id);

        if (!$invoice) {
            return $this->json(['error' => 'Facture non trouvee'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($invoice);
        $this->em->flush();

        return $this->json(['message' => 'Facture supprimee']);
    }
}
