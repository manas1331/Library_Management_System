# Library_Management_System


## Problem Statement:
- Traditional library management involves manual record-keeping, leading to inefficiencies such as book misplacement, slow book searching, and difficulty tracking due dates.
- The LMS aims to streamline these processes by providing a centralized digital platform for managing library activities





## Key Features:
### 1. Book Catalog Management
- Librarians can add, update, and remove books from the Catalog.
- Members can search books by title, author, subject, and publication date.
### 2. User Management
- New members can register.
- Users can log in/logout and view their accounts.
- Membership can be cancelled or updated.
### 3. Book Transactions
- Borrowing & Returning: Members can checkout books, and librarians issue books.
- Reservations: Members can reserve books and cancel reservations.
- Overdue Fines: Users must pay fines for late returns.
### 4. Notifications
- System sends overdue notifications.
- Members receive reservation availability and cancellation notifications.

## Use-Case Diagram:
![Use_Case_Final](https://github.com/user-attachments/assets/88baf129-15e3-4667-8563-a4260a194bd7)

________________________________________________________________________________
## Architecture Patterns
- Model – View – Controller Pattern (MVC)

## Design Principles
#### 1. Single Responsibility Principle (SRP)
#### 2. Open/Closed Principle (OCP)
#### 3. Dependency Inversion Principle (DIP)
#### 4. Interface Segregation Principle (ISP)

## Design Patterns
#### 1. Facade Pattern
#### 2. Builder Pattern
#### 3. Command Pattern
#### 4. Adapter Pattern

## Commands to Run


### 1. Backend Directory

Navigate to the backend directory and run:

 ```bash 
  mvn spring-boot:run   
```

### 2. Frontend Directory
 ```bash 
npm install lucide-react @radix-ui/react-slot class-variance-authority clsx tailwindcss-animate --legacy-peer-deps
```

```bash
npm run dev
```

#### Keep MongoDB running at all times.


