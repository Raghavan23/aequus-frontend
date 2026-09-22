import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { Client, ClientRequest } from '../../models/client.model';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  private readonly clientService = inject(ClientService);

  clients: Client[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  showAddModal = false;
  isEditing = false;
  editingClientId: string | null = null;

  clientForm: ClientRequest = {
    name: '',
    gstin: '',
    pan: '',
    tallyCompanyName: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: ''
  };

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;
    this.clientService.getAllClients().subscribe({
      next: (cls) => {
        this.clients = cls;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load clients.';
      }
    });
  }

  openAddModal(): void {
    this.isEditing = false;
    this.editingClientId = null;
    this.clientForm = {
      name: '',
      gstin: '',
      pan: '',
      tallyCompanyName: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: ''
    };
    this.showAddModal = true;
  }

  openEditModal(client: Client): void {
    this.isEditing = true;
    this.editingClientId = client.id;
    this.clientForm = {
      name: client.name,
      gstin: client.gstin || '',
      pan: client.pan || '',
      tallyCompanyName: client.tallyCompanyName || '',
      contactPerson: client.contactPerson || '',
      contactEmail: client.contactEmail || '',
      contactPhone: client.contactPhone || ''
    };
    this.showAddModal = true;
  }

  saveClient(): void {
    if (!this.clientForm.name.trim()) {
      this.errorMessage = 'Client company name is required.';
      return;
    }

    if (this.isEditing && this.editingClientId) {
      this.clientService.updateClient(this.editingClientId, this.clientForm).subscribe({
        next: () => {
          this.successMessage = 'Client updated successfully.';
          this.showAddModal = false;
          this.loadClients();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to update client.';
        }
      });
    } else {
      this.clientService.createClient(this.clientForm).subscribe({
        next: () => {
          this.successMessage = 'Client created successfully.';
          this.showAddModal = false;
          this.loadClients();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to create client.';
        }
      });
    }
  }

  toggleActive(client: Client): void {
    this.clientService.toggleActive(client.id).subscribe({
      next: () => {
        client.active = !client.active;
      }
    });
  }

  deleteClient(client: Client): void {
    if (confirm(`Are you sure you want to delete ${client.name}?`)) {
      this.clientService.deleteClient(client.id).subscribe({
        next: () => {
          this.loadClients();
        }
      });
    }
  }
}
