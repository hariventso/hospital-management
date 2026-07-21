<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\Notification;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/notifications')]
class NotificationController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
    ) {}

    #[Route('', name: 'notification_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $notifications = $this->em->getRepository(Notification::class)->findBy(
            [],
            ['createdAt' => 'DESC'],
            50,
        );

        $unreadCount = $this->em->getRepository(Notification::class)->countUnread();

        return $this->json([
            'notifications' => array_map(
                fn(Notification $n) => $n->toArray(),
                $notifications,
            ),
            'unreadCount' => $unreadCount,
        ]);
    }

    #[Route('/unread-count', name: 'notification_unread_count', methods: ['GET'])]
    public function unreadCount(): JsonResponse
    {
        $count = $this->em->getRepository(Notification::class)->countUnread();

        return $this->json(['unreadCount' => $count]);
    }

    #[Route('/{id}/read', name: 'notification_mark_read', methods: ['PUT'])]
    public function markRead(int $id): JsonResponse
    {
        $notification = $this->em->getRepository(Notification::class)->find($id);

        if (!$notification) {
            return $this->json(['error' => 'Notification non trouvée'], Response::HTTP_NOT_FOUND);
        }

        $notification->setIsRead(true);
        $this->em->flush();

        return $this->json([
            'message' => 'Notification marquée comme lue',
            'notification' => $notification->toArray(),
        ]);
    }

    #[Route('/read-all', name: 'notification_mark_all_read', methods: ['PUT'])]
    public function markAllRead(): JsonResponse
    {
        $unread = $this->em->getRepository(Notification::class)->findBy(['isRead' => false]);

        foreach ($unread as $notification) {
            $notification->setIsRead(true);
        }

        $this->em->flush();

        return $this->json(['message' => 'Toutes les notifications marquées comme lues']);
    }

    #[Route('/{id}', name: 'notification_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $notification = $this->em->getRepository(Notification::class)->find($id);

        if (!$notification) {
            return $this->json(['error' => 'Notification non trouvée'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($notification);
        $this->em->flush();

        return $this->json(['message' => 'Notification supprimée']);
    }
}
