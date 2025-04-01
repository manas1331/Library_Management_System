package com.library.repository;

import com.library.model.Fine;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface FineRepository extends MongoRepository<Fine, String> {
    List<Fine> findByMemberId(String memberId);
    List<Fine> findByMemberIdAndPaidIsFalse(String memberId);
}

