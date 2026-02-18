package com.it342.backend.controller;

import com.cloudinary.Cloudinary;
import com.it342.backend.model.Item;
import com.it342.backend.repository.ItemRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*")
public class ItemController {

    private final ItemRepository itemRepository;
    private final Cloudinary cloudinary;

    public ItemController(ItemRepository itemRepository, Cloudinary cloudinary) {
        this.itemRepository = itemRepository;
        this.cloudinary = cloudinary;
    }

    @GetMapping
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    @GetMapping("/{id}")
    public Item getItemById(@PathVariable Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
    }

    @PostMapping("/upload")
    public Item uploadItem(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam double price,
            @RequestParam String category,
            @RequestParam String location,
            @RequestParam String sellerName,
            @RequestParam String sellerEmail,
            @RequestParam("image") MultipartFile image
    ) throws IOException {

        Map uploadResult = cloudinary.uploader().upload(
                image.getBytes(),
                Map.of("folder", "tradeoff")
        );

        String imageUrl = uploadResult.get("secure_url").toString();

        Item item = new Item();
        item.setTitle(title);
        item.setDescription(description);
        item.setPrice(price);
        item.setCategory(category);
        item.setLocation(location);

        item.setSellerName(sellerName);
        item.setSellerEmail(sellerEmail);

        item.setImageUrl(imageUrl);

        return itemRepository.save(item);
    }

    @DeleteMapping("/{id}")
    public void deleteItem(@PathVariable Long id) {
        itemRepository.deleteById(id);
    }
}
