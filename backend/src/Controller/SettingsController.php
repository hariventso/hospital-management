<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/settings')]
class SettingsController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {}

    #[Route('/profile', name: 'settings_update_profile', methods: ['PUT'])]
    public function updateProfile(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || empty($data['userId'])) {
            return $this->json(['error' => 'userId requis'], Response::HTTP_BAD_REQUEST);
        }

        $user = $this->em->getRepository(User::class)->find($data['userId']);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouve'], Response::HTTP_NOT_FOUND);
        }

        if (!empty($data['name'])) {
            $user->setName($data['name']);
        }

        if (!empty($data['email'])) {
            if ($data['email'] !== $user->getEmail()) {
                $existing = $this->em->getRepository(User::class)->findOneBy(['email' => $data['email']]);
                if ($existing) {
                    return $this->json(['error' => 'Cet email est deja utilise'], Response::HTTP_BAD_REQUEST);
                }
            }
            $user->setEmail($data['email']);
        }

        $this->em->flush();

        return $this->json([
            'message' => 'Profil mis a jour',
            'user' => [
                'id' => $user->getId(),
                'name' => $user->getName(),
                'email' => $user->getEmail(),
            ],
        ]);
    }

    #[Route('/password', name: 'settings_update_password', methods: ['PUT'])]
    public function updatePassword(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || empty($data['userId']) || empty($data['currentPassword']) || empty($data['newPassword'])) {
            return $this->json(['error' => 'Tous les champs sont obligatoires'], Response::HTTP_BAD_REQUEST);
        }

        $user = $this->em->getRepository(User::class)->find($data['userId']);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouve'], Response::HTTP_NOT_FOUND);
        }

        if (!$this->passwordHasher->isPasswordValid($user, $data['currentPassword'])) {
            return $this->json(['error' => 'Mot de passe actuel incorrect'], Response::HTTP_BAD_REQUEST);
        }

        if (strlen($data['newPassword']) < 6) {
            return $this->json(['error' => 'Le nouveau mot de passe doit contenir au moins 6 caracteres'], Response::HTTP_BAD_REQUEST);
        }

        $hashedPassword = $this->passwordHasher->hashPassword($user, $data['newPassword']);
        $user->setPassword($hashedPassword);

        $this->em->flush();

        return $this->json(['message' => 'Mot de passe mis a jour avec succes']);
    }

    #[Route('/me', name: 'settings_get_me', methods: ['GET'])]
    public function getMe(Request $request): JsonResponse
    {
        $userId = $request->query->get('userId');

        if (!$userId) {
            return $this->json(['error' => 'userId requis'], Response::HTTP_BAD_REQUEST);
        }

        $user = $this->em->getRepository(User::class)->find((int) $userId);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouve'], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'user' => [
                'id' => $user->getId(),
                'name' => $user->getName(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
            ],
        ]);
    }
}
