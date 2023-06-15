const add_button = document.getElementById('add');
const notes = JSON.parse(localStorage.getItem('notes'));
let noteId = 0;

if(notes) {
    notes.forEach(note => add_note(note));
}

add_button.addEventListener("click", () => add_note());

function add_note(text = "") {
    const note = document.createElement('div');
    note.id = `note-${noteId}`;
    noteId++;
    note.classList.add("note");


    note.innerHTML = `
            <div id="config" class="config">
                <nav class="more">
                    <ul>
                        <li><a href="#" class="fa-solid fa-bars"></a>
                            <ul>
                                <li><a href="#" id="save-pdf">save to pdf</a></li>
                                <li><a href="#" id="send-email">send e-mail</a></li>                    
                                <li><a href="#" id="save-notion">save to notion</a></li>
                            </ul>
                        </li>
                    </ul>
                </nav>
                <button class="edit">
                    <i class="fa-solid fa-floppy-disk"></i>
                </button>
                <button class="delete">
                    <i class="fa-solid fa-xmark" alt="delete"></i>
                </button>
            </div>

            <div class="main ${text ? "" : "hidden"}"></div>
            <textarea class="${text ? "hidden" : ""}" placeholder="type your annotations here"></textarea>
    `;

    // save to pdf
    const savePdfOption = note.querySelector(`#${note.id} #save-pdf`);
    savePdfOption.addEventListener("click", () => {
        const noteId = note.id;
        saveNoteAsPdf(noteId);
    });

    function saveNoteAsPdf(noteId) {
        const images = document.querySelector("img");
        if (images) {
            images.style.display = 'none';
        }

        const noteElement = document.getElementById(noteId);
        const noteContent = noteElement.querySelector(".main").innerHTML;
        

        const opt = {
        margin: [1.0, 1.25, 1.0, 1.25], 
        filename: 'note.pdf',
        image: { type: 'jpeg', quality: 0.98 }, 
        html2canvas: { scale: 2 }, 
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } 
        };

        html2pdf().set(opt).from(noteContent).save();
        if (images) {
            images.style.removeProperty("display");
        }
    }
    //

    // send email
    const sendEmailOption = note.querySelector(`#${note.id} #send-email`);
    sendEmailOption.addEventListener("click", () => {
        const noteId = note.id;
        openEmailModal(noteId);
    });

    function openEmailModal(noteId) {
        const modal = document.getElementById('modal');
        modal.style.display = 'block';

        const emailForm = document.getElementById('email-form');
        emailForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const recipientEmail = document.getElementById('recipient-email').value;
            const subject = document.getElementById('email-subject').value;

            sendNoteByEmail(noteId, recipientEmail, subject);

            modal.style.display = 'none';
            emailForm.reset();
        });

        const cancelButton = document.getElementById('cancel-button');
        cancelButton.addEventListener('click', () => {
        modal.style.display = 'none';
        emailForm.reset();
    });
    }

    // enviar a nota por e-mail
    function sendNoteByEmail(noteId, recipientEmail, subject) {
        const noteElement = document.getElementById(noteId);
        // const noteContent = noteElement.querySelector(".main").innerHTML;
        // const textarea = note.querySelector("textarea");
        const textarea = noteElement.querySelector("textarea");

        // const emailBody = `Conteúdo da nota:\n\n${noteContent}`;

        const convert = textarea.value;
        const text = convertMarkdownToText(convert);

        // const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
        const emailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  window.open(emailUrl, '_blank');
        // window.open(mailtoLink);
    }   
    //

    function convertMarkdownToText(markdown) {
        const html = marked(markdown);
        const tempElement = document.createElement('div');
        tempElement.innerHTML = html;
        const text = tempElement.innerText;
        
        return text;
    }

    const edit_button = note.querySelector(".edit");
    const delete_button = note.querySelector(".delete");
    const main = note.querySelector(".main");
    const textarea = note.querySelector("textarea");
    const notearea = note.querySelector(".config");

    notearea.addEventListener('dblclick', function() {
        if(textarea.style.filter == 'blur(5px)') {
            textarea.style.filter = 'blur(0px)';
            main.style.filter = 'blur(0px)';
        }
        else {
            textarea.style.filter = 'blur(5px)';
            main.style.filter = 'blur(5px)';
        }
    });

    textarea.value = text;
    main.innerHTML = marked(text);

    delete_button.addEventListener("click", () => {
        note.remove();
        storage();
    });

    edit_button.addEventListener("click", () => {
        main.classList.toggle("hidden");
        textarea.classList.toggle("hidden");
    });

    textarea.addEventListener("input", (e) => {
        const {value} = e.target;

        main.innerHTML = marked(value);
        storage();
    });

    document.body.appendChild(note);

}

function storage() {
    const text_notes = document.querySelectorAll("textarea");
    const notes = [];

    text_notes.forEach(note => notes.push(note.value));

    localStorage.setItem("notes", JSON.stringify(notes));
}
