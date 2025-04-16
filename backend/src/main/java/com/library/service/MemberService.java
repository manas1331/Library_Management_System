package com.library.service;

import com.library.model.Member;
import com.library.model.AccountStatus;
import com.library.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

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
    
    public Member addMember(Member member) {
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

