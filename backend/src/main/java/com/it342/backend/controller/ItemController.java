package com.it342.backend.controller;

import com.cloudinary.Cloudinary;
import com.it342.backend.model.Item;
import com.it342.backend.repository.ItemRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
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
            @RequestParam String condition,
            @RequestParam String location,
            @RequestParam String sellerName,
            @RequestParam String sellerEmail,
            @RequestParam(value = "images", required = false) MultipartFile[] images,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) throws IOException {
        List<String> uploadedImageUrls = uploadImages(images, image);
        if (uploadedImageUrls.isEmpty()) {
            throw new RuntimeException("At least one image is required");
        }

        Item item = new Item();
        item.setTitle(title);
        item.setDescription(description);
        item.setPrice(price);
        item.setCategory(category);
        item.setCondition(condition);
        item.setLocation(location);

        item.setSellerName(sellerName);
        item.setSellerEmail(sellerEmail);

        item.setImageUrl(String.join(",", uploadedImageUrls));

        return itemRepository.save(item);
    }

    @PutMapping("/{id}")
    public Item updateItem(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam double price,
            @RequestParam String category,
            @RequestParam String condition,
            @RequestParam String location,
            @RequestParam String sellerName,
            @RequestParam String sellerEmail,
            @RequestParam(value = "images", required = false) MultipartFile[] images,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) throws IOException {
        Item existing = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        boolean ownedByEmail =
                sellerEmail != null &&
                !sellerEmail.isBlank() &&
                existing.getSellerEmail() != null &&
                !existing.getSellerEmail().isBlank() &&
                sellerEmail.equalsIgnoreCase(existing.getSellerEmail());

        boolean ownedByNameWhenLegacy =
                (existing.getSellerEmail() == null || existing.getSellerEmail().isBlank()) &&
                sellerName != null &&
                !sellerName.isBlank() &&
                existing.getSellerName() != null &&
                sellerName.equalsIgnoreCase(existing.getSellerName());

        if (!ownedByEmail && !ownedByNameWhenLegacy) {
            throw new RuntimeException("Not authorized to edit this listing");
        }

        existing.setTitle(title);
        existing.setDescription(description);
        existing.setPrice(price);
        existing.setCategory(category);
        existing.setCondition(condition);
        existing.setLocation(location);
        existing.setSellerName(sellerName);
        existing.setSellerEmail(sellerEmail);

        List<String> uploadedImageUrls = uploadImages(images, image);
        if (!uploadedImageUrls.isEmpty()) {
            existing.setImageUrl(String.join(",", uploadedImageUrls));
        }

        return itemRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public void deleteItem(
            @PathVariable Long id,
            @RequestParam String sellerEmail,
            @RequestParam(required = false) String sellerName
    ) {
        Item existing = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        boolean ownedByEmail =
                sellerEmail != null &&
                !sellerEmail.isBlank() &&
                existing.getSellerEmail() != null &&
                !existing.getSellerEmail().isBlank() &&
                sellerEmail.equalsIgnoreCase(existing.getSellerEmail());

        boolean ownedByNameWhenLegacy =
                (existing.getSellerEmail() == null || existing.getSellerEmail().isBlank()) &&
                sellerName != null &&
                !sellerName.isBlank() &&
                existing.getSellerName() != null &&
                sellerName.equalsIgnoreCase(existing.getSellerName());

        if (!ownedByEmail && !ownedByNameWhenLegacy) {
            throw new RuntimeException("Not authorized to delete this listing");
        }

        itemRepository.deleteById(id);
    }

    private List<String> uploadImages(MultipartFile[] images, MultipartFile singleImage) throws IOException {
        List<MultipartFile> files = new ArrayList<>();
        if (images != null) {
            for (MultipartFile file : images) {
                if (file != null && !file.isEmpty()) {
                    files.add(file);
                }
            }
        }

        if (files.isEmpty() && singleImage != null && !singleImage.isEmpty()) {
            files.add(singleImage);
        }

        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    Map.of("folder", "tradeoff")
            );
            urls.add(uploadResult.get("secure_url").toString());
        }
        return urls;
    }
}
