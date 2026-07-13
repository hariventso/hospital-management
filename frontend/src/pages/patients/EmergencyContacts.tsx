import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Phone, Search, MoreHorizontal } from 'lucide-react'

const contacts = [
  { id: 1, patient: 'Marie Rakoto', name: 'Jean Rakoto', relation: 'Epoux', phone: '034 11 222 33', priority: 1 },
  { id: 2, patient: 'Jean Rabe', name: 'Sophie Rabe', relation: 'Epouse', phone: '033 44 555 66', priority: 1 },
  { id: 3, patient: 'Sophie Andry', name: 'Paul Andry', relation: 'Pere', phone: '032 77 888 99', priority: 2 },
  { id: 4, patient: 'Paul Rasoamanarivo', name: 'Marie Rasoamanarivo', relation: 'Epouse', phone: '034 00 111 22', priority: 1 },
]

export default function EmergencyContacts() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contacts d'urgence</h1>
          <p className="text-muted-foreground">Contacts deurgence des patients.</p>
        </div>
        <Button>
          <Plus className="mr-2 size-4" />
          Ajouter un contact
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Rechercher un contact..."
                className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <Phone className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.relation} de {contact.patient}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm font-medium">{contact.phone}</p>
                  <Badge variant="outline">Priorite {contact.priority}</Badge>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
