package com.it342.backend.controller;

import com.cloudinary.Cloudinary;
import com.it342.backend.model.Item;
import com.it342.backend.model.UserRole;
import com.it342.backend.repository.ItemRepository;
import com.it342.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*")
public class ItemController {

    private final ItemRepository itemRepository;
    private final Cloudinary cloudinary;
    private final UserRepository userRepository;

    public ItemController(
            ItemRepository itemRepository,
            Cloudinary cloudinary,
            UserRepository userRepository
    ) {
        this.itemRepository = itemRepository;
        this.cloudinary = cloudinary;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    @GetMapping("/search")
    public List<Item> searchItems(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String location
    ) {
        String normalizedQ = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
        String normalizedCategory = category == null ? "" : category.trim().toLowerCase(Locale.ROOT);
        String normalizedLocation = location == null ? "" : location.trim().toLowerCase(Locale.ROOT);

        return itemRepository.findAll()
                .stream()
                .filter(item -> {
                    if (normalizedQ.isBlank()) return true;
                    String searchable = String.join(" ",
                                    safe(item.getTitle()),
                                    safe(item.getDescription()),
                                    safe(item.getCategory()),
                                    safe(item.getCondition()),
                                    safe(item.getLocation()),
                                    safe(item.getSellerName()),
                                    safe(item.getSellerEmail()),
                                    String.valueOf(item.getPrice())
                            )
                            .toLowerCase(Locale.ROOT);
                    return searchable.contains(normalizedQ);
                })
                .filter(item -> normalizedCategory.isBlank() ||
                        safe(item.getCategory()).toLowerCase(Locale.ROOT).equals(normalizedCategory))
                .filter(item -> normalizedLocation.isBlank() ||
                        safe(item.getLocation()).toLowerCase(Locale.ROOT).contains(normalizedLocation))
                .filter(item -> minPrice == null || item.getPrice() >= minPrice)
                .filter(item -> maxPrice == null || item.getPrice() <= maxPrice)
                .toList();
    }

    @GetMapping("/seller")
    public List<Item> getItemsBySeller(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String name
    ) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        String normalizedName = name == null ? "" : name.trim().toLowerCase(Locale.ROOT);

        if (normalizedEmail.isBlank() && normalizedName.isBlank()) {
            throw new RuntimeException("Either email or name is required");
        }

        return itemRepository.findAll()
                .stream()
                .filter(item -> normalizedEmail.isBlank() ||
                        safe(item.getSellerEmail()).toLowerCase(Locale.ROOT).equals(normalizedEmail))
                .filter(item -> normalizedName.isBlank() ||
                        safe(item.getSellerName()).toLowerCase(Locale.ROOT).equals(normalizedName))
                .toList();
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
            @RequestParam(required = false) String sellerName,
            @RequestParam(required = false) String adminEmail
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

        boolean deletedByAdmin =
                adminEmail != null &&
                !adminEmail.isBlank() &&
                userRepository.findByEmail(adminEmail.trim())
                        .map(user -> user.getRole() == UserRole.ADMIN)
                        .orElse(false);

        if (!ownedByEmail && !ownedByNameWhenLegacy && !deletedByAdmin) {
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

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
