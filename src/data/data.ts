import { Year } from "../core/domain/types/year.js";

export const courseCredits: Year = {
  "First Year": {
    "First Semester": {
      "Module 1": [
        { name: "Logic", credits: 3, grade: "A" },
        { name: "Programming 1", credits: 2, grade: "A-" },
        { name: "History of Software Engineering", credits: 2, grade: "A" },
      ],
      "Module 2": [
        { name: "Discrete Mathematics", credits: 3, grade: "A" },
        { name: "Operating Systems 1", credits: 2, grade: "A" },
      ],
      "Module 3": [
        { name: "Calculus 1", credits: 3, grade: "A" },
        { name: "Software Development 1", credits: 3, grade: "A" },
        { name: "Database 1", credits: 2, grade: "A" },
      ],
    },
    "Second Semester": {
      "Module 1": [
        { name: "Linear Algebra", credits: 3, grade: "A" },
        { name: "Programming 2", credits: 3, grade: "A" },
        { name: "Operating System 2", credits: 2, grade: "A" },
      ],
      "Module 2": [
        { name: "Software Development 2", credits: 3, grade: "A" },
        { name: "Database 2", credits: 2, grade: "A" },
      ],
      "Module 3": [
        { name: "Communication 1", credits: 3, grade: "A" },
        { name: "Calculus 2", credits: 3, grade: "A" },
      ],
    },
  },
  "Second Year": {
    "Third Semester": {
      "Module 1": [
        { name: "Programming 3", credits: 2, grade: "A" },
        { name: "Software Quality Engineering 1", credits: 3, grade: "A" },
        { name: "Communication 2", credits: 3, grade: "A" },
      ],
      "Module 2": [
        { name: "Software Development 3", credits: 3, grade: "A" },
        { name: "Computer Networks 1", credits: 2, grade: "A" },
      ],
      "Module 3": [
        { name: "Statistics", credits: 3, grade: "A" },
        { name: "Software Quality Engineering 2", credits: 2, grade: "A" },
        { name: "Writing & Composition 1", credits: 3, grade: "A" },
      ],
    },
    "Fourth Semester": {
      "Module 1": [
        { name: "Algorithmics 1", credits: 3, grade: "A" },
        { name: "Programming 4", credits: 3, grade: "A" },
        { name: "Writing & Composition 2", credits: 3, grade: "A" },
      ],
      "Module 2": [
        { name: "Software Development 4", credits: 3, grade: "A" },
        { name: "Computer Networks 2", credits: 2, grade: "A" },
      ],
      "Module 3": [
        { name: "Development & Operations", credits: 2, grade: "A" },
        { name: "Software Quality Engineering 3", credits: 2, grade: "A" },
      ],
    },
  },
  "Third Year": {
    "Fifth Semester": {
      "Module 1": [
        { name: "Algorithmics 2", credits: 2, grade: "A" },
        { name: "Programming 5", credits: 3, grade: "A" },
        { name: "Software Architecture 1", credits: 2, grade: "A-" },
      ],
      "Module 2": [
        { name: "Software Development 5", credits: 3, grade: "A" },
        { name: "Data Science", credits: 2, grade: "A" },
      ],
      "Module 3": [
        { name: "Internet of Things", credits: 2, grade: "A" },
        { name: "Deep Learning/ Generative AI", credits: 2, grade: "A" },
      ],
    },
    "Sixth Semester": {
      "Module 1": [
        { name: "Programming 6", credits: 3 },
        { name: "Software Architecture 2", credits: 2 },
        { name: "User Interface & User Experience Design", credits: 2 },
      ],
      "Module 2": [
        { name: "Software Development 6", credits: 3 },
        { name: "Web Development", credits: 2 },
      ],
      "Module 3": [
        { name: "Programming Languages", credits: 2 },
        { name: "Systems Administration", credits: 2 },
      ],
    },
  },
  "Fourth Year": {
    "Seventh Semester": {
      "Module 1": [
        { name: "Programming 7", credits: 3 },
        { name: "Software Architecture 3", credits: 2 },
      ],
      "Module 2": [{ name: "Software Architecture 4", credits: 2 }],
      "Module 3": [
        { name: "Mobile Application Development", credits: 2 },
        { name: "Software Projects & Startups", credits: 2 },
      ],
    },
    "Eighth Semester": {
      "Module 1": [
        { name: "Research Project on Software Development 1", credits: 4 },
      ],
      "Module 2": [
        { name: "Research Project on Software Development 2", credits: 4 },
      ],
      "Module 3": [
        { name: "Research Project on Software Development 3", credits: 4 },
      ],
    },
  },
};
