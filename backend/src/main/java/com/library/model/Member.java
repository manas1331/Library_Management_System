package com.library.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "members")
public class Member {
    @Id
    private String id;
    private String name;
    private String email;
    private String phone;
    private Address address;
    private Date dateOfMembership;
    private int totalBooksCheckedout;
    private AccountStatus status;
    private String password;

    public Member() {
        this.dateOfMembership = new Date();
        this.totalBooksCheckedout = 0;
        this.status = AccountStatus.ACTIVE;
    }

    public Member(String name, String email, String phone, Address address) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.dateOfMembership = new Date();
        this.totalBooksCheckedout = 0;
        this.status = AccountStatus.ACTIVE;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Address getAddress() {
        return address;
    }
    public void getPassword(String password){
        this.password=password;
    }
    public String getPassword(){
        return password;
    }
    public void setAddress(Address address) {
        this.address = address;
    }

    public Date getDateOfMembership() {
        return dateOfMembership;
    }

    public void setDateOfMembership(Date dateOfMembership) {
        this.dateOfMembership = dateOfMembership;
    }

    public int getTotalBooksCheckedout() {
        return totalBooksCheckedout;
    }

    public void setTotalBooksCheckedout(int totalBooksCheckedout) {
        this.totalBooksCheckedout = totalBooksCheckedout;
    }

    public AccountStatus getStatus() {
        return status;
    }

    public void setStatus(AccountStatus status) {
        this.status = status;
    }

    // Business logic
    public boolean canCheckoutBook() {
        return totalBooksCheckedout < 5 && status == AccountStatus.ACTIVE;
    }

    public void incrementTotalBooksCheckedout() {
        this.totalBooksCheckedout++;
    }

    public void decrementTotalBooksCheckedout() {
        if (this.totalBooksCheckedout > 0) {
            this.totalBooksCheckedout--;
        }
    }
}

