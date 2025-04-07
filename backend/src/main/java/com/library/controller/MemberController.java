package com.library.controller;

import com.library.facade.LibraryFacade;
import com.library.model.Member;
import com.library.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
public class MemberController {
    @Autowired 
    private LibraryFacade libraryFacade;
    @Autowired
    private MemberService memberService;
    
    @GetMapping
    public ResponseEntity<List<Member>> getAllMembers() {
        return ResponseEntity.ok(memberService.getAllMembers());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Member> getMemberById(@PathVariable String id) {
        Optional<Member> member = memberService.getMemberById(id);
        return member.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Member>> searchMembers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email) {
        
        if (email != null && !email.isEmpty()) {
            Member member = memberService.findByEmail(email);
            if (member != null) {
                return ResponseEntity.ok(List.of(member));
            }
            return ResponseEntity.ok(List.of());
        } else if (name != null && !name.isEmpty()) {
            return ResponseEntity.ok(memberService.findByName(name));
        } else {
            return ResponseEntity.ok(memberService.getAllMembers());
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<Member> registerMember(@RequestBody Member member) {
        // Delegate member registration to the facade
        Member registered = libraryFacade.registerMember(member);
        return ResponseEntity.status(HttpStatus.CREATED).body(registered);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Member> updateMember(@PathVariable String id, @RequestBody Member member) {
        if (memberService.getMemberById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        member.setId(id);
        return ResponseEntity.ok(memberService.updateMember(member));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable String id) {
        if (memberService.getMemberById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        memberService.deleteMember(id);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{id}/block")
    public ResponseEntity<Void> blockMember(@PathVariable String id) {
        if (memberService.blockMember(id)) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}/unblock")
    public ResponseEntity<Void> unblockMember(@PathVariable String id) {
        if (memberService.unblockMember(id)) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}

