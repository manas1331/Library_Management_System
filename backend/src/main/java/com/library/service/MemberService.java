package com.library.service;

import com.library.model.Member;
import com.library.model.AccountStatus;
import com.library.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class MemberService {
    
    @Autowired
    private MemberRepository memberRepository;
    
    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }
    
    public Optional<Member> getMemberById(String id) {
        return memberRepository.findById(id);
    }
    
    public Member findByEmail(String email) {
        return memberRepository.findByEmail(email);
    }
    
    public List<Member> findByName(String name) {
        return memberRepository.findByName(name);
    }
    
    // Add this method to generate a custom ID
    private String generateMemberId() {
        Random random = new Random();
        String id;
        boolean unique = false;
        
        // Keep generating until we find a unique ID
        do {
            // Generate a 4-digit number and format it as PES1LIBxxxx
            int randomNum = 1000 + random.nextInt(9000); // This gives a number between 1000-9999
            id = "PES1LIB" + randomNum;
            
            // Check if this ID already exists
            unique = !memberRepository.existsById(id);
        } while (!unique);
        
        return id;
    }
    
    public Member addMember(Member member) {
        // Set a custom ID if not already set
        if (member.getId() == null || member.getId().isEmpty()) {
            member.setId(generateMemberId());
        }
        if (member.getPassword() == null || member.getPassword().isEmpty()) {
            member.setPassword("12345678"); // Set a default password
        }
        return memberRepository.save(member);
    }
    
    public Member updateMember(Member member) {
        return memberRepository.save(member);
    }
    
    public void deleteMember(String id) {
        memberRepository.deleteById(id);
    }
    
    public boolean blockMember(String id) {
        Optional<Member> memberOpt = memberRepository.findById(id);
        if (memberOpt.isPresent()) {
            Member member = memberOpt.get();
            member.setStatus(AccountStatus.BLACKLISTED);
            memberRepository.save(member);
            return true;
        }
        return false;
    }
    
    public boolean unblockMember(String id) {
        Optional<Member> memberOpt = memberRepository.findById(id);
        if (memberOpt.isPresent()) {
            Member member = memberOpt.get();
            member.setStatus(AccountStatus.ACTIVE);
            memberRepository.save(member);
            return true;
        }
        return false;
    }
    
    public boolean incrementBooksCheckedout(String id) {
        Optional<Member> memberOpt = memberRepository.findById(id);
        if (memberOpt.isPresent()) {
            Member member = memberOpt.get();
            if (member.canCheckoutBook()) {
                member.incrementTotalBooksCheckedout();
                memberRepository.save(member);
                return true;
            }
        }
        return false;
    }
    
    public boolean decrementBooksCheckedout(String id) {
        Optional<Member> memberOpt = memberRepository.findById(id);
        if (memberOpt.isPresent()) {
            Member member = memberOpt.get();
            member.decrementTotalBooksCheckedout();
            memberRepository.save(member);
            return true;
        }
        return false;
    }
    
    public boolean updateMemberStatus(String id, AccountStatus status) {
        Optional<Member> memberOpt = getMemberById(id);
        if (memberOpt.isPresent()) {
            Member member = memberOpt.get();
            member.setStatus(status);
            updateMember(member);
            return true;
        }
        return false;
    }
}

