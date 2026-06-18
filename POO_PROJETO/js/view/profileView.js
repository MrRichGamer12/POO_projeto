import { initPrivatePage, showBadgeNotifications, showMessage } from "./commonView.js";
import AuthService from "../service/AuthService.js";
import AchievementService from "../service/AchievementService.js";

class ProfileView {

    constructor(user) {
        this.user = user;
        this.elements = {
            photoPreview: document.getElementById("profilePhotoPreview"),
            displayName: document.getElementById("profileDisplayName"),
            email: document.getElementById("profileEmail"),
            bioText: document.getElementById("profileBioText"),
            form: document.getElementById("profileForm"),
            nameInput: document.getElementById("profileNameInput"),
            bioInput: document.getElementById("profileBioInput"),
            photoInput: document.getElementById("profilePhotoInput"),
            photoFile: document.getElementById("profilePhotoFile"),
            message: document.getElementById("profileMessage"),
            logoutBtn: document.getElementById("logoutBtn")
        };

        this.uploadedPhoto = "";
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        this.elements.form.addEventListener("submit", event => {
            event.preventDefault();
            this.saveProfile();
        });

        this.elements.photoFile.addEventListener("change", event => {
            const file = event.target.files[0];

            if (!file) {
                this.uploadedPhoto = "";
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                this.uploadedPhoto = reader.result;
                this.renderPhoto(reader.result);
            };
            reader.readAsDataURL(file);
        });

        this.elements.logoutBtn.addEventListener("click", () => AuthService.logout());
    }

    saveProfile() {
        const name = this.elements.nameInput.value.trim();
        const bio = this.elements.bioInput.value.trim();
        const photo = this.uploadedPhoto || this.elements.photoInput.value.trim();

        if (!name) {
            showMessage(this.elements.message, "O nome é obrigatório.", "error");
            return;
        }

        this.user.updateProfile(name, bio, photo);
        AuthService.saveCurrentUser(this.user);

        const badges = AchievementService.checkAndSave(this.user);
        showBadgeNotifications(badges);
        showMessage(this.elements.message, "Perfil atualizado com sucesso.", "success");
        this.render();
    }

    render() {
        this.elements.displayName.textContent = this.user.name;
        this.elements.email.textContent = this.user.email;
        this.elements.bioText.textContent = this.user.bio || "Ainda sem bio.";
        this.elements.nameInput.value = this.user.name || "";
        this.elements.bioInput.value = this.user.bio || "";
        this.elements.photoInput.value = this.user.photo && this.user.photo.startsWith("http") ? this.user.photo : "";
        this.renderPhoto(this.user.photo);
    }

    renderPhoto(photo) {
        if (photo) {
            this.elements.photoPreview.outerHTML = `<img id="profilePhotoPreview" class="profile-photo" src="${photo}" alt="Foto de perfil">`;
            this.elements.photoPreview = document.getElementById("profilePhotoPreview");
            return;
        }

        const initials = (this.user.name || "FU")
            .split(" ")
            .map(part => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

        this.elements.photoPreview.outerHTML = `<div id="profilePhotoPreview" class="profile-photo-placeholder">${initials}</div>`;
        this.elements.photoPreview = document.getElementById("profilePhotoPreview");
    }
}

const user = initPrivatePage("profile");

if (user) {
    new ProfileView(user);
}
