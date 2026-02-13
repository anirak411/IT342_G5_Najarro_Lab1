package com.it342.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "items")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private double price;

    private String sellerName;

    public Item() {}

    public Item(String title, String description, double price, String sellerName) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.sellerName = sellerName;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public double getPrice() {
        return price;
    }

    public String getSellerName() {
        return sellerName;
    }
}
