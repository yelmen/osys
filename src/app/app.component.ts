import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import domtoimage from 'dom-to-image';

export interface Student {
  no: string;
  name: string;
  takenExam: string;
}

export interface Classroom {
  name: string;
  capacity: number;
  students: Student[];
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  declare myForm: UntypedFormGroup;
  declare date: string;
  title = 'osys';
  constructor() {
    this.myForm = new UntypedFormGroup({
      date: new UntypedFormControl(''),
    });
  }
  ngOnInit(): void {}

  students: Student[] = [];
  classrooms: Classroom[] = [];

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const arrayBuffer = fileReader.result;
        const data = new Uint8Array(arrayBuffer as ArrayBufferLike);
        const workbook = XLSX.read(data, { type: 'array' });

        // İlk çalışma sayfasını seçin
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Verileri JSON formatına dönüştürün
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: true,
        }) as any[];

        // Verileri Student türünden nesnelere dönüştürün
        this.students = jsonData.map((row: any) => ({
          no: row[Object.keys(row)[0]],
          name: row[Object.keys(row)[1]],
          takenExam: row[Object.keys(row)[2]],
        }));

        // Verileri konsola bastırın

        // Sınıflara öğrencileri dağıtın
        // this.allocateStudentsToClassrooms();
      };

      fileReader.readAsArrayBuffer(file);
    }
  }

  onFileChangeClasses(event: any) {
    const file = event.target.files[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const arrayBuffer = fileReader.result;
        const data = new Uint8Array(arrayBuffer as ArrayBufferLike);
        const workbook = XLSX.read(data, { type: 'array' });

        // İlk çalışma sayfasını seçin
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Verileri JSON formatına dönüştürün
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: true });

        // Verileri Classroom türünden nesnelere dönüştürün
        this.classrooms = jsonData.map((row: any) => ({
          name: row[Object.keys(row)[0]],
          capacity: row[Object.keys(row)[1]],
          students: [],
        }));

        // Verileri konsola bastırın
        // Sınıflara öğrencileri dağıtın
        // this.allocateStudentsToClassrooms();
      };

      fileReader.readAsArrayBuffer(file);
    }
  }

  // Öğrencileri sınıflara dağıtan fonksiyon
  shuffleArray(array: any[]): any[] {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }

  allocateStudentsToClassrooms() {
    this.date = this.myForm.get('date')?.value;
    // Öğrencileri karıştır
    const shuffledStudents = this.shuffleArray([...this.students]);

    shuffledStudents.forEach((student) => {
      let allocated = false;

      for (let i = 0; i < this.classrooms.length; i++) {
        if (this.classrooms[i].students.length < this.classrooms[i].capacity) {
          this.classrooms[i].students.push(student);
          allocated = true;
          break;
        }
      }

      if (!allocated) {
        console.log(`Öğrenci ${student.name} sınıflara dağıtılamadı.`);
      }
    });
  }

  public openPDF(i: number, className: string): void {
    let DATA: any = document.getElementById(`htmlData${i}`);

    // html2canvas çağrısında ignoreElements özelliği kullanılması
    html2canvas(DATA, {
      ignoreElements: (element) => {
        // Bu fonksiyon belirli öğeleri (örneğin, butonu) hariç tutar
        return element.tagName === 'BUTTON';
      },
    }).then((canvas) => {
      let fileWidth = 208;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a4');
      let position = 0;
      PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
      PDF.save(`${className}.pdf`);
    });
  }
}
