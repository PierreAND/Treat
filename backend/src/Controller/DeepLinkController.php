<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class DeepLinkController extends AbstractController
{
    #[Route('/redirect/reset-password', name: 'deep_link_redirect')]
    public function deepLinkRedirect(Request $request): Response
    {
        $token = $request->query->get('token');
        $deepLink = 'exp://192.168.1.24:8081/--/reset-password?token=' . htmlspecialchars($token);

        return new Response(
            '<html><body><script>
            window.location.href = "' . $deepLink . '";
        </script>
        <p>Ouverture de l\'app... <a href="' . $deepLink . '">Cliquez ici si rien ne se passe</a></p>
        </body></html>'
        );
    }
}
