package com.it342.backend.repository;

import com.it342.backend.model.EscrowTransaction;
import com.it342.backend.model.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EscrowTransactionRepository extends JpaRepository<EscrowTransaction, Long> {

    List<EscrowTransaction> findByBuyerEmailIgnoreCaseOrSellerEmailIgnoreCaseOrderByCreatedAtDesc(
            String buyerEmail,
            String sellerEmail
    );

    List<EscrowTransaction> findAllByOrderByCreatedAtDesc();

    boolean existsByItemIdAndStatusIn(Long itemId, List<TransactionStatus> statuses);
}
