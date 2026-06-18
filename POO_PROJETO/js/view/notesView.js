

import { initPrivatePage, showMessage } from "./commonView.js";
import AuthService from "../service/AuthService.js";
import NoteModel from "../model/NoteModel.js";

class NotesView {

    constructor(user) {
        this.user = user;
        this.user.notes = (this.user.notes || []).map(note => NoteModel.fromObject(note));
        this.searchTerm = "";

        this.elements = {
            form: document.getElementById("noteForm"),
            formTitle: document.getElementById("noteFormTitle"),
            noteId: document.getElementById("noteId"),
            title: document.getElementById("noteTitle"),
            content: document.getElementById("noteContent"),
            message: document.getElementById("noteMessage"),
            cancelEditBtn: document.getElementById("cancelNoteEditBtn"),
            search: document.getElementById("noteSearch"),
            list: document.getElementById("notesList")
        };

        this.bindEvents();
        this.render();
    }

    bindEvents() {
        this.elements.form.addEventListener("submit", event => {
            event.preventDefault();
            this.saveNote();
        });

        this.elements.cancelEditBtn.addEventListener("click", () => this.resetForm());

        this.elements.search.addEventListener("input", event => {
            this.searchTerm = event.target.value.toLowerCase().trim();
            this.render();
        });
    }

    saveNote() {
        const title = this.elements.title.value.trim();
        const content = this.elements.content.value.trim();
        const noteId = this.elements.noteId.value;

        if (!title) {
            showMessage(this.elements.message, "Escreve um título para a nota.", "error");
            return;
        }

        if (noteId) {
            const note = this.user.notes.find(item => String(item.id) === String(noteId));
            if (note) {
                note.update(title, content);
                showMessage(this.elements.message, "Nota atualizada com sucesso.", "success");
            }
        }
        else {
            this.user.notes.push(new NoteModel(title, content));
            this.user.markActivity();
            showMessage(this.elements.message, "Nota criada com sucesso.", "success");
        }

        this.saveUser();
        this.resetForm(false);
        this.render();
    }

    editNote(noteId) {
        const note = this.user.notes.find(item => String(item.id) === String(noteId));
        if (!note) {
            return;
        }

        this.elements.formTitle.textContent = "Editar nota";
        this.elements.noteId.value = note.id;
        this.elements.title.value = note.title;
        this.elements.content.value = note.content;
        this.elements.title.focus();
    }

    deleteNote(noteId) {
        const note = this.user.notes.find(item => String(item.id) === String(noteId));
        const confirmed = confirm(`Tem a certeza de que pretende remover a nota "${note?.title || "selecionada"}"?`);

        if (!confirmed) {
            return;
        }

        this.user.notes = this.user.notes.filter(item => String(item.id) !== String(noteId));
        this.user.markActivity();
        this.saveUser();
        this.render();
        showMessage(this.elements.message, "Nota removida.", "success");
    }

    resetForm(clearMessage = true) {
        this.elements.formTitle.textContent = "Nova nota";
        this.elements.noteId.value = "";
        this.elements.title.value = "";
        this.elements.content.value = "";
        if (clearMessage) {
            showMessage(this.elements.message, "", "");
        }
    }

    saveUser() {
        AuthService.saveCurrentUser(this.user);
    }

    getFilteredNotes() {
        const notes = [...(this.user.notes || [])].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        if (!this.searchTerm) {
            return notes;
        }

        return notes.filter(note =>
            String(note.title || "").toLowerCase().includes(this.searchTerm) ||
            String(note.content || "").toLowerCase().includes(this.searchTerm)
        );
    }

    render() {
        const notes = this.getFilteredNotes();
        this.elements.list.innerHTML = "";

        if (notes.length === 0) {
            this.elements.list.innerHTML = `<p class="empty-state">Ainda não existem notas neste filtro.</p>`;
            return;
        }

        notes.forEach(note => {
            const item = document.createElement("article");
            item.className = "note-card";
            item.innerHTML = `
                <div class="note-card-header">
                    <div>
                        <h3>${note.title}</h3>
                        <small>Criada: ${this.formatDate(note.createdAt)} · Atualizada: ${this.formatDate(note.updatedAt)}</small>
                    </div>
                </div>
                <p>${note.content || "Sem conteúdo."}</p>
                <div class="button-row">
                    <button class="secondary-button editNote" data-id="${note.id}">Editar</button>
                    <button class="danger-button deleteNote" data-id="${note.id}">Remover</button>
                </div>
            `;
            this.elements.list.appendChild(item);
        });

        this.bindListButtons();
    }

    bindListButtons() {
        document.querySelectorAll(".editNote").forEach(button => {
            button.addEventListener("click", () => this.editNote(button.dataset.id));
        });

        document.querySelectorAll(".deleteNote").forEach(button => {
            button.addEventListener("click", () => this.deleteNote(button.dataset.id));
        });
    }

    formatDate(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return "Sem data";
        }
        return date.toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" });
    }
}

const user = initPrivatePage("notes");

if (user) {
    new NotesView(user);
}
